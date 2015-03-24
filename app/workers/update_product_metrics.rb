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

    grouped_total_visitors do |product, total|
      product.update!(total_visitors: total)
    end

    grouped_idea_visitors do |idea, total|
      idea.update!(total_visitors: total)
    end
  end

  def grouped_metrics(grouping, &blk)
    visits(grouping).group_by{|v| v['date']}.each do |date, visits|
      totals = total_accounts(grouping, date)

      visits.each do |v|
        if product = find_product(v['app_id'])
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
  end

  def grouped_total_visitors(&blk)
    total_visitors.each do |r|
      if product = find_product(r['app_id'])
        blk.call(product, r['total'].to_i)
      end
    end
  end

  def grouped_idea_visitors(&blk)
    total_idea_visitors.each do |r|
      if r['path'] =~ /\/([\w-]+)$/
        if idea = Idea.find_by(slug: $1)
          blk.call(idea, r['total'].to_i)
        end
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

  def total_visitors
    pg.exec(%Q{
      SELECT COUNT(DISTINCT(domain_userid)) as total, app_id FROM "atomic".events GROUP BY app_id;
    }).to_a
  end

  def total_idea_visitors
    pg.exec(%Q{
      select count(distinct(domain_userid)) as total,
        page_urlpath as path
      from atomic.events
      where page_urlhost='assembly.com'
        and page_urlpath like '/ideas/%'
      group by page_urlpath
    }).to_a
  end

  def find_product(app_id)
    Product.find_by(asmlytics_key: app_id).tap do |product|
      if product.nil?
        Rails.logger.info("asmlytics missing_product=#{app_id}")
      end
    end
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
