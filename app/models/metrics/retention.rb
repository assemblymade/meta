module Metrics
  class Retention < KPI
    def average
      cohorts = MixpanelClient.new.request(
        'retention',
        from_date: 5.weeks.ago.strftime('%Y-%m-%d'),
        to_date: Time.now.strftime('%Y-%m-%d'),
        retention_type: 'birth',
        born_event: 'user.created',
        unit: 'week'
      )

      cohorts.
        map{|date, vals| {date => (vals['counts'][1].to_i / vals['first'].to_f) } }.
        sort_by{|e| Date.parse(e.keys.first) }
    end
  end
end
