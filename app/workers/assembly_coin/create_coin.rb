module AssemblyCoin
  class CreateCoin < AssemblyCoin::Worker

    def perform(product_id, total_coins)
      product = Product.find(product_id)
      state = product.state
      if state === 'greenlit' or state === 'profitable' then
        Transactions.new.forge_coins(product_id, total_coins)
      end
      
    end

  end
end
