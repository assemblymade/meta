module AssemblyCoin
  class CreateCoin < AssemblyCoin::Worker

    def perform(product_id, total_coins)
      puts "hey"
      product = Product.find_by(id: product_id)
      if not product.nil?
        state = product.state
        if state == 'greenlit' or state == 'profitable' then
          OpenAssets::Transactions.new.forge_coins(product_id, total_coins)
          product.update!(issued_coins: Time.now)
        else
          puts "Coin Not Created: Only Greenlit or Profitable Products allowed"
        end
      else
        puts "Product Not Found"
      end

    end
  end
end
