namespace :products do

  task :queue_blockchain_txs => :environment do
    Product.find_each do |product|
      if product.state == 'greenlit' || product.state == 'profitable'
        AssemblyCoin::TransactionsOnBlockchain.new.perform(product.id)
      end
    end
  end

end
