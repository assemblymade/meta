module Metrics
  class EngagedUsers < KPI
    ENGAGED_AUTHED_USERS = '$custom_event:18157'

    def initialize(start_at, end_at)
      result = MixpanelClient.new.request(
        'segmentation',
        event: ENGAGED_AUTHED_USERS,
        from_date: start_at.strftime('%Y-%m-%d'),
        to_date: end_at.strftime('%Y-%m-%d'),
        type: 'unique',
        unit: 'week')

      @metrics = result['data']['values'][ENGAGED_AUTHED_USERS]
    end

    def between(start_at, end_at)
      engaged_users = @metrics.find do |date, _|
        delta = start_at.to_date - Date.parse(date)
        delta >= 0 && delta < 7
      end[1]

      Percentage.new(engaged_users / User.where('created_at < ?', end_at).count.to_f)
    end
  end
end
