require 'google/api_client'

class FetchGoogleAnalytics
  include Sidekiq::Worker

  attr_reader :i

  def perform(integration_id)
    @i = Integration.find(integration_id)

    Rails.logger.info "integration=#{i.id} product=#{i.product.slug} config=#{i.config.inspect}"

    client = GAClient.new(i.refresh_token, i.config)

    client.monthly('ga:users').each do |year, month, visits|
      date = Date.parse([year, month, 1].join('-'))
      m = i.product.monthly_metrics.find_or_initialize_by(date: date)
      m.update!(
        ga_uniques: visits.to_i
      )
    end
  end
end
