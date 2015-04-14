module OpenAssets
  class BlockchainServer
    def create_btc_maintenance(product, amount)
      params = {
        public_address: ENV['CENTRAL_ADDRESS_PUBLIC_ADDRESS'],
        private_key: ENV['CENTRAL_ADDRESS_PRIVATE_KEY'],
        recipient_address: product.wallet_public_address,
        amount: amount,
        identifier: "#{product.id}:#{product.wallet_public_address}:#{amount}"
      }

      remote = OpenAssets::Remote.new("http://coins.assembly.com")
      end_url="btc/maintain"
      remote.post end_url, params.to_json
    end

    def kill_btc_maintenance(product, destination)
      params = {
        public_address: product.wallet_public_address,
        private_key: product.wallet_private_key,
        recipient_address: destination
      }

      remote = OpenAssets::Remote.new("http://coins.assembly.com")
      end_url="btc/maintain/kill"
      remote.post end_url, params.to_json
    end
  end
end
