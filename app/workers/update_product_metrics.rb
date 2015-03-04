class UpdateProductMetrics
  include Sidekiq::Worker
  sidekiq_options queue: 'analytics'

  def perform
    grouped_metrics('day') do |product, date, totals, v|
      m = product.daily_metrics.find_or_initialize_by(date: date)
      m.update!(
        uniques: v['uniques'].to_i,
        visits: v['visits'].to_i,
        registered_visits: v['registered_visits'].to_i,
        total_accounts: totals['registered_users'].to_i
      )
    end

    grouped_metrics('week') do |product, date, totals, v|
      m = product.weekly_metrics.find_or_initialize_by(date: date)
      m.update!(
        uniques: v['uniques'].to_i,
        visits: v['visits'].to_i,
        registered_visits: v['registered_visits'].to_i,
        total_accounts: totals['registered_users'].to_i
      )
    end
  end

  def grouped_metrics(grouping, &blk)
    visits(grouping).group_by{|v| v['date']}.each do |date, visits|
      totals = total_accounts(grouping, date)

      visits.each do |v|
        product = Product.find_by(asmlytics_key: v['app_id'])
        if product.nil?
          Rails.logger.info("asmlytics missing_product=#{v['app_id']}")
          next
        end

        t = totals.find{|t| t['app_id'] == v['app_id'] }
        if t.nil?
          Rails.logger.info("asmlytics missing_totals=#{v['app_id']}")
          next
        end

        Rails.logger.info "#{date} #{t} #{v}"
        blk.call(product, date, t, v)
      end
    end
  end

  def visits(grouping)
    pg.exec(%Q{
      SELECT
          app_id,
          DATE_TRUNC('#{grouping}', collector_tstamp) as "date",
          COUNT(distinct(domain_userid)) as "uniques",
          COUNT(distinct(domain_userid || '-' || domain_sessionidx)) as "visits",
          COUNT(distinct(user_id)) as "registered_visits"
        FROM "atomic".events
        WHERE collector_tstamp > current_date - integer '31'
        GROUP BY 1, 2
        ORDER BY 1, 2;
      }).to_a
  end

  def total_accounts(grouping, at_date)
    pg.exec(%Q{
      SELECT
        app_id,
        COUNT(distinct(user_id)) as "registered_users"
      FROM "atomic".events
      WHERE DATE_TRUNC('#{grouping}', collector_tstamp) <= '#{at_date}'
      GROUP BY 1
      ORDER BY 1;
    })
  end

  def pg
    @pg ||= begin
      conn = URI.parse(ENV['ASMLYTICS_REDSHIFT'])
      PG.connect(
        host: URI.decode(conn.host),
        port: conn.port,
        user: conn.user,
        password: conn.password,
        dbname: conn.path[1..-1]
      )
    end
  end
end
