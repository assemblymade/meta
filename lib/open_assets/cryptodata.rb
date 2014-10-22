module OpenAssets
  class Cryptodata

    def color_url(product_id)
      wallet_public_address = Product.find_by(id: product_id).wallet_public_address

        url = "https://coins.assembly.com/colors/null"

      if not wallet_public_address.nil?

        url = "https://coins.assembly.com/colors/"+ wallet_public_address

      end

      return url

    end

  end
end
