namespace :product do
  desc "Sets product trends by activities"
  task :create_trends => :environment do
    Product.all.each do |product|
      product.product_trend = ProductTrend.create!(product_id: product.id)
      product.product_trend.set_score!
    end
  end

  desc "Destroys all the ProductTrends"
  task :destroy_trends => :environment do
    ProductTrend.delete_all
  end

  desc "Rebuilds ProductTrends"
  task :rebuild_trends => [:destroy_trends, :create_trends]
end
