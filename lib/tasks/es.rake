namespace :es do
  desc 'Import models into elasticsearch'
  task :import => :environment do
    [
      Wip.includes(:comments, :product),
      User,
      Product.includes(:product_trend, markings: :mark)
    ].each do |model|
      model.__elasticsearch__.create_index! force: true
      model.import
    end
  end

  desc 'Drop elasticsearch indexes'
  task :drop => :environment do
    [
      Wip,
      User,
      Product
    ].each do |model|
      model.__elasticsearch__.client.indices.delete index: model.index_name rescue nil
    end
  end
end
