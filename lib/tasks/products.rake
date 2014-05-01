namespace :products do
  task :update_commit_counts => :environment do
    Product.repos_gt(0).each do |product|
      Github::UpdateCommitCount.new.perform(product.id)
    end
  end
end
