class AppSerializer < ApplicationSerializer
  attributes :name, :pitch, :slug, :logo_url, :try_url, :popular_open_tags

  attributes :recent_activity

  def logo_url
    object.logo_url == Product::DEFAULT_IMAGE_PATH ? File.join(root_url, Product::DEFAULT_IMAGE_PATH) : object.logo_url
  end

  def popular_open_tags
    ['design', 'ruby']
  end

  def recent_activity
    data_range = 31
    Rails.cache.fetch([object, 'recent_activity_by_week', Date.today, data_range]) do
      # data = object.activities.
      #          group("date_trunc('week', created_at)").
      #          order('date_trunc_week_created_at desc').
      #          limit(data_range).count.map{|k,v| [k.strftime('%Y-%m-%d'),v]}
      # (data_range.days.ago.to_date..1.day.ago).map do |date|
      #   value = data[date.strftime('%Y-%m-%d')] || 0
      #   [[Math.log([value, 1].max, 1.2), 0.1].max, value]
      # end

      range = [data_range.weeks.ago, Date.today - 1].map{|d| d.strftime('%Y-%m-%d 00:00') }

      data = ActiveRecord::Base.connection.execute(%Q{
        SELECT date, coalesce(count,0) AS count
        FROM generate_series(
          '#{range[0]}'::timestamp,
          '#{range[1]}'::timestamp,
          '7 days') AS date
        LEFT OUTER JOIN (
          SELECT COUNT(*) AS count, date_trunc('week', created_at) as week
          FROM activities WHERE product_id = '#{object.id}'
          GROUP BY week order by week) results
        ON (date = results.week)
      }).to_a

      data.to_a.map do |result|
        [Math.log([result['count'].to_i, 1].max, 1.2), 0.1].max
      end
    end
  end
end
