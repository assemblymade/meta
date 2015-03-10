module Metrics
  class InfluenceCount < KPI
    def between(start_at, end_at)
      # mixpanel only gives us the most recent N days, weeks, or months worth of events.
      weeks = ((Time.now - start_at) / 1.week).ceil
      result = MixpanelClient.new.request('events', event: [TrackInfluenced::EVENT_NAME], type: 'general', unit: 'week', interval: weeks.ceil)

      influence_count = result['data']['values'][TrackInfluenced::EVENT_NAME].find do |date, _|
        delta = start_at.to_date - Date.parse(date)
        delta >= 0 && delta < 7
      end[1]

      RawNumber.new(influence_count)
    end
  end
end
