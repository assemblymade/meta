require 'google/api_client'

class FetchGoogleAnalytics

  def perform(integration_id)
    i = Integration.find(integration_id)

    client = Google::APIClient.new(
      application_name: 'Assembly',
      application_version: '1'
    )
    client.authorization.client_id = ENV['GOOGLE_CLIENT_ID']
    client.authorization.client_secret = ENV['GOOGLE_CLIENT_SECRET']
    client.authorization.refresh_token = i.refresh_token
    client.authorization.grant_type = 'refresh_token'
    client.authorization.fetch_access_token!

    analytics = client.discovered_api('analytics', 'v3')

    result = client.execute(analytics.management.accounts.list)
    account = result.data.items.count == 1 ? result.data.items.first : result.data.items.find{|o| o.name == i.config['account_name'] }
    if account.nil?
      raise "not found (account:#{i.config['account_name']})"
    end

    result = client.execute(analytics.management.webproperties.list, accountId: account.id)
    property = result.data.items.count == 1 ? result.data.items.first : result.data.items.find{|o| o.name == i.config['property_name'] }
    if account.nil?
      raise "not found (property:#{i.config['property_name']})"
    end

    result = client.execute(analytics.management.profiles.list, accountId: account.id, webPropertyId: property.id)
    profile = result.data.items.count == 1 ? result.data.items.first : result.data.items.find{|o| o.name == i.config['profile_name'] }
    if account.nil?
      raise "not found (profile:#{i.config['profile_name']})"
    end

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

    result.data.rows.each do |year, month, visits|
      date = Date.parse([year, month, 1].join('-'))
      m = i.product.monthly_metrics.find_or_initialize_by(date: date)
      m.update!(
        ga_uniques: visits.to_i,
      )
    end
  end
end
