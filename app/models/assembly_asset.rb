class AssemblyAsset < ActiveRecord::Base
  belongs_to :product
  belongs_to :user

  PROMO_COINS=100

  def grant!(promo=false)
    AssemblyAsset.transaction do
      return unless user

      if user.wallet_public_address.nil?
        assign_key_pair!(user)
      end

      transfer_coins_to_user

      save!
    end
  end

  def blockchain_url
    if asset_id
      "https://blockchain.info/tx/#{asset_id}"
    end
  end

  def assets_url
    ENV["ASSEMBLY_COINS_URL"]
  end

  private

  def assign_key_pair!(user)
    key_pair = get_key_pair

    user.update(
      wallet_public_address: key_pair["public_address"],
      wallet_private_key: key_pair["private_key"]
    )
  end

  def get_key_pair
    get "/v2/addresses"
  end

  def get(url)
    request :get, url
  end

  def post(url, body = {})
    request :post, url, body
  end

  def request(method, url, body = {})
    resp = connection.send(method) do |req|
      req.url url
      req.headers['Accept'] = 'application/json'
      req.headers['Content-Type'] = 'application/json'
      req.body = body.to_json
    end

    JSON.load(resp.body)
  end

  def connection
    Faraday.new(url: assets_url) do |faraday|
      faraday.adapter  :net_http
    end
  end
end
