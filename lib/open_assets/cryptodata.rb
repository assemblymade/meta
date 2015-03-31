module OpenAssets
  class Cryptodata

    def color_url(product)
      if wallet_public_address = product.wallet_public_address
        if product.state == 'greenlit' || product.state == 'profitable'
          "http://coins.assembly.com/colors/#{wallet_public_address}"
        end
      end
    end

  end
end
