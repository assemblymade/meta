class AssemblyAsset < ActiveRecord::Base
  belongs_to :product
  belongs_to :user

  def grant!(promo=false)
    AssemblyAsset.transaction do
      if user.wallet_public_address.nil?
        assign_key_pair!(user)
      end

      if asset = transfer_coins_to_user(product, user, amount)
        update(asset_id: asset["transaction_hash"])
      else
        raise "An error occurred transfering coins from #{product.name} to #{user.username}"
      end
    end
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
    get "/v1/addresses"
  end

  def transfer_coins_to_user(product, user, amount)
    body = {
      from_public_address: product.wallet_public_address,
      from_private_key: product.wallet_private_key,
      amount: amount,
      source_address: product.wallet_public_address,
      to_public_address: user.wallet_public_address
    }

    post "/v1/transactions/transfer", body
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
      req.headers['Content-Type'] = 'application/x-www-form-urlencoded'
      req.body = body.to_json
    end

    JSON.load(resp.body)
  end

  def connection
    Faraday.new(url: ENV["ASSETS_URL"]) do |faraday|
      faraday.adapter  :net_http
    end
  end
end
