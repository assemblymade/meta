require 'google/api_client'

class FetchGoogleAnalytics
  include Sidekiq::Worker
  
  attr_reader :i

  def perform(integration_id)
    @i = Integration.find(integration_id)

    Rails.logger.info "integration=#{i.id} product=#{i.product.slug} config=#{i.config.inspect}"

    monthly_metrics.each do |year, month, visits|
      date = Date.parse([year, month, 1].join('-'))
      m = i.product.monthly_metrics.find_or_initialize_by(date: date)
      m.update!(
        ga_uniques: visits.to_i,
      )
    end
  end

  def monthly_metrics
    result = client.execute(
      api_method: analytics.data.ga.get,
      parameters: {
        'start-date' => i.product.created_at.beginning_of_month.strftime("%Y-%m-%d"),
        'end-date' => DateTime.now.strftime("%Y-%m-%d"),
        'ids' => "ga:#{profile.id}",
        'dimensions' => "ga:year,ga:month",
        'metrics' => "ga:visits",
        'sort' => "ga:year,ga:month"
      }
    )

    result.data.rows
  end

  def profile
    @profile ||= begin
      result = client.execute(analytics.management.accounts.list)
      accounts = result.data.items.count == 1 ? [result.data.items.first] : result.data.items.select{|o| o.name == i.config['account_name'] }
      if accounts.empty?
        raise "not found (account:#{i.config['account_name']}) #{result.data.items.map(&:name)}"
      end

      Rails.logger.info "integration=#{i.id} product=#{i.product.slug} config=#{i.config.inspect} accounts=#{accounts.map(&:name)}"

      account = nil
      property = nil
      accounts.find do |a|
        result = client.execute(analytics.management.webproperties.list, accountId: a.id)
        property = result.data.items.count == 1 ? result.data.items.first : result.data.items.find{|o| o.name == i.config['property_name'] }
        if property
          account = a
        end
      end
      if property.nil?
        raise "not found (property:#{i.config['property_name']}) #{result.data.items.map(&:name)}"
      end

      Rails.logger.info "integration=#{i.id} product=#{i.product.slug} config=#{i.config.inspect} account=#{account.name} property=#{property.name}"

      result = client.execute(analytics.management.profiles.list, accountId: account.id, webPropertyId: property.id)
      profile = result.data.items.count == 1 ? result.data.items.first : result.data.items.find{|o| o.name == i.config['profile_name'] }
      if profile.nil?
        raise "not found (profile:#{i.config['profile_name']}) #{result.data.items.map(&:name)}"
      end

      Rails.logger.info "integration=#{i.id} product=#{i.product.slug} config=#{i.config.inspect} account=#{account.name} property=#{property.name}"

      profile
    end
  end

  def analytics
    @analytics ||= client.discovered_api('analytics', 'v3')
  end

  def client
    @client ||= begin
      client = Google::APIClient.new(
        application_name: 'Assembly',
        application_version: '1'
      )
      client.authorization.client_id = ENV['GOOGLE_CLIENT_ID']
      client.authorization.client_secret = ENV['GOOGLE_CLIENT_SECRET']

      if i.refresh_token
        client.authorization.refresh_token = i.refresh_token
        client.authorization.grant_type = 'refresh_token'
        client.authorization.fetch_access_token!
      else
        client.authorization.access_token = i.access_token
        client.authorization.grant_type = 'authorization_code'
      end
      client
    end
  end
end
