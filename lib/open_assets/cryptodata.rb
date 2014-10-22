module OpenAssets
  class Cryptodata

    def color_url(product_id)
      if wallet_public_address = Product.find_by(id: product_id).wallet_public_address
        "https://coins.assembly.com/colors/#{wallet_public_address}"
      end
    end

  end
end
