namespace :products do
  task :update_commit_counts => :environment do
    Product.repos_gt(0).each do |product|
      Github::UpdateCommitCount.new.perform(product.id)
    end
  end

  task :assign_key_pairs => :environment do
    Product.find_each do |product|
      if product.wallet_public_address.nil?
        AssignProductKeyPair.assign(product)
      end
    end
  end

  task :initialize_assembly_assets_wallet => :environment do
  end
end
