module Metrics
  class Retention < KPI
    def average
      result = MixpanelClient.new.request(
        'retention',
        from_date: 5.weeks.ago.strftime('%Y-%m-%d'),
        to_date: 2.weeks.ago.end_of_week.strftime('%Y-%m-%d'),
        retention_type: 'birth',
        born_event: 'user.created',
        unit: 'week'
      )

      cohorts = result.
        map{|date, vals| {date => (vals['counts'][1].to_i / vals['first'].to_f) } }.
        sort_by{|e| Date.parse(e.keys.first) }

      cohorts.map{|e| e.values.first}.reduce(:+) / cohorts.size.to_f
    end
  end
end
