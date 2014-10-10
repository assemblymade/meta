class AssignBitcoinKeyPairWorker
  include Sidekiq::Worker

  def perform(recipient_id)
    recipient = GlobalID::Locator.locate recipient_id

    if key_pair = get_key_pair
      recipient.update!(
        wallet_public_address: key_pair["public_address"],
        wallet_private_key: key_pair["private_key"]
      )
    end
  end

  private

  def get_key_pair
    get "/v1/addresses"
  end

  def get(url)
    request :get, url
  end

  def request(method, url, body = {})
    resp = connection.send(method) do |req|
      req.url url
      req.headers['Content-Type'] = 'application/json'
      req.body = body.to_json
    end

    begin
      JSON.load(resp.body)
    rescue => e
      puts "#{e.message}"
    end
  end

  def connection
    Faraday.new(url: ENV.fetch("ASSEMBLY_COINS_URL")) do |faraday|
      faraday.adapter  :net_http
    end
  end
end
