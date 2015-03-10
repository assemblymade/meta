module Metrics
  class KPI
    def self.weekly_report(at=Time.now)
      start_at = at.beginning_of_week - 3.weeks
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
        weeks = 4.times.
                  map{|i| start_at + i.weeks }.
                  map{|start_at| k.between(start_at, start_at.end_of_week)}

        [
          k.name,
          weeks[3].to_s,
          weeks[3].change_from(weeks[2]).to_s,
          weeks[2].to_s,
          weeks[3].change_from(weeks[0]).to_s,
          weeks[0].to_s,
        ]
      end
      [["KPI (Wk ending #{start_at.end_of_week.to_date})", "Weekly Total", "Weekly Change", "Previous Week", "4 Week Change", "4 Weeks ago"]] + rows
    end

    def name
      self.class.name.split('::').last.titleize
    end
  end
end
