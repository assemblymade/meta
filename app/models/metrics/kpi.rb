module Metrics
  class KPI
    def self.weekly_report(at=Time.now)
      start_at = at.beginning_of_week - 7.weeks
      end_at = at.end_of_week

      uniques_cache = ProductUniquesCache.new(start_at, end_at)
      rows = [
          NewUsers.new,
          EngagedUsers.new(start_at, end_at),
          InfluenceCount.new,
          LiveProducts.new,
          ProductUniques.new(uniques_cache),
          ProductUniques.new(uniques_cache, 'saas'),
          ProductUniques.new(uniques_cache, 'mobile'),
          ProductUniques.new(uniques_cache, 'web'),
        ].map do |k|
        weeks = 8.times.
                  map{|i| start_at + i.weeks }.
                  map{|start_at| k.between(start_at, start_at.end_of_week)}

        # we need to know if we're averaging raw numbers or percentages
        num_type = weeks[0].class
        four_wk_avg = num_type.new(weeks[3..7].map(&:raw).reduce(0, :+) / 4.0).
          change_from(num_type.new(weeks[0..3].map(&:raw).reduce(0, :+) / 4.0))

        [
          k.name,
          weeks[7].to_s,
          weeks[7].change_from(weeks[6]).to_s,
          weeks[6].to_s,
          four_wk_avg.to_s,
          weeks[0].to_s,
        ]
      end
      [["KPI (Wk ending #{end_at.to_date})", "Wk Total", "Wk Change", "Prev Wk", "4 Wk / 4 Wk average", "8 Wks ago"]] + rows
    end

    def name
      self.class.name.split('::').last.titleize
    end
  end
end
