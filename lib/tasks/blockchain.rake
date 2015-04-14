namespace :products do

  task :queue_blockchain_txs => :environment do
    Product.where(state: ['greenlit', 'profitable']).each do |product|
      AssemblyCoin::BlockchainUpdateProduct.new.perform(product)
    end
  end
end
