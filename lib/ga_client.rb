require 'google/api_client'

class GAClient
  attr_reader :refresh_token, :config

  def initialize(refresh_token, config)
    @refresh_token = refresh_token
    @config = config
  end

  def monthly(metrics='ga:users', start_date=1.month.ago.beginning_of_month, end_date=DateTime.now)
    result = client.execute(
      api_method: analytics.data.ga.get,
      parameters: {
        'start-date' => start_date.strftime("%Y-%m-%d"),
        'end-date' => end_date.strftime("%Y-%m-%d"),
        'ids' => "ga:#{profile.id}",
        'dimensions' => "ga:year,ga:month",
        'metrics' => Array(metrics).join(','),
        'sort' => "ga:year,ga:month"
      }
    )

    result.data.rows
  end

  def weekly(metrics='ga:users', start_date=1.month.ago.beginning_of_month, end_date=DateTime.now)
    result = client.execute(
      api_method: analytics.data.ga.get,
      parameters: {
        'start-date' => start_date.strftime("%Y-%m-%d"),
        'end-date' => end_date.strftime("%Y-%m-%d"),
        'ids' => "ga:#{profile.id}",
        'dimensions' => "ga:year,ga:week",
        'metrics' => Array(metrics).join(','),
        'sort' => "ga:year,ga:week"
      }
    )

    result.data.rows
  end

  def profile
    @profile ||= begin
      result = client.execute(analytics.management.accounts.list)
      accounts = result.data.items.count == 1 ? [result.data.items.first] : result.data.items.select{|o| o.name == config['account_name'] }
      if accounts.empty?
        raise "not found (account:#{config['account_name']}) #{result.data.items.map(&:name)}"
      end

      Rails.logger.info "config=#{config.inspect} accounts=#{accounts.map(&:name)}"

      account = nil
      property = nil
      accounts.find do |a|
        result = client.execute(analytics.management.webproperties.list, accountId: a.id)
        property = result.data.items.count == 1 ? result.data.items.first : result.data.items.find{|o| o.name == config['property_name'] }
        if property
          account = a
        end
      end
      if property.nil?
        raise "not found (property:#{config['property_name']}) #{result.data.items.map(&:name)}"
      end

      Rails.logger.info "config=#{config.inspect} account=#{account.name} property=#{property.name}"

      result = client.execute(analytics.management.profiles.list, accountId: account.id, webPropertyId: property.id)
      profile = result.data.items.count == 1 ? result.data.items.first : result.data.items.find{|o| o.name == config['profile_name'] }
      if profile.nil?
        raise "not found (profile:#{config['profile_name']}) #{result.data.items.map(&:name)}"
      end

      Rails.logger.info "config=#{config.inspect} account=#{account.name} property=#{property.name}"

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
      client.authorization.refresh_token = refresh_token
      client.authorization.grant_type = 'refresh_token'
      client.authorization.fetch_access_token!
      client
    end
  end

end
