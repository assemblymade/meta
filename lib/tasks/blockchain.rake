namespace :products do

  task :queue_blockchain_txs => :environment do
    Product.where(state: ['greenlit', 'profitable']).each do |product|
      AssemblyCoin::MaintainBtcBalance.new.perform(product.id)
      AssemblyCoin::BlockchainUpdateProduct.new.perform(product)
    end
  end
end
