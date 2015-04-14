module OpenAssets
  class BlockchainServer
    def create_btc_maintenance(product, destination, amount)
      params = {
        public_address: product.wallet_public_address,
        private_key: product.wallet_private_key,
        recipient_address: destination,
        amount: amount,
        identifier: "#{product.id}:#{destination}:#{amount}"
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
