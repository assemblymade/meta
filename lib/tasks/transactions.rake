namespace :products do

  task :queue_blockchain_txs => :environment do
    Product.where(state: ['greenlit', 'profitable']).each do |product|
      AssemblyCoin::TransactionsOnBlockchain.new.perform(product.id)
    end
  end
end
