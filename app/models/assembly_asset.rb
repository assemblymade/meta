class AssemblyAsset < ActiveRecord::Base
  belongs_to :product
  belongs_to :user

  def self.grant!(product, user, amount, promo=false)
    AssemblyAsset.transaction do
      if user.public_address.nil?
        assign_key_pair!(user)
      end

      AssemblyAsset.create!(product: product, user: user, asset_id: asset.id) #? asset.transaction_hash
    end
  end

  private

  def assign_key_pair!(user)
    key_pair = get_key_pair
    public_address = key_pair["public_address"]

    encrypt_and_assign_private_key!(user, key_pair["private_key"])
    user.update(public_address: public_address)
  end

  def encrypt_and_sign_private_key(user, key)
    # http://ruby-doc.org/stdlib-2.1.0/libdoc/openssl/rdoc/OpenSSL/Cipher.html#class-OpenSSL::Cipher-label-Encrypting+and+decrypting+some+data

    cipher = OpenSSL::Cipher::AES256.new(:CBC)
    cipher.encrypt
    salt = cipher.random_key
    iv = cipher.random_iv
    private_key = cipher.update(key) + cipher.final

    user.update(salt: salt, iv: iv, private_key: private_key)
  end

  def get_key_pair
    get "/v1/addresses"
  end

  def get(url)
    request :get, url
  end

  def post
  end

  def request(method, url, body = {})
    resp = connection.send(method) do |req|
      req.url url
      req.headers['Content-Type'] = 'application/json'
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
