namespace :es do
  desc 'Import models into elasticsearch'
  task :import => :environment do
    client = Elasticsearch::Model.client
    [
<<<<<<< HEAD
      Wip.includes(:comments, :product),
      User,
      Product.includes(:product_trend, markings: :mark)
    ].each do |model|
=======
      # [Wip, Wip.includes(:comments, :product)],
      [User, User],
      [Product, Product.includes(:product_trend, markings: :mark)]
    ].each do |model, query|
>>>>>>> e128b5de4a66939eaa944fe0910fe2c5c5bc9347
      model.__elasticsearch__.create_index! force: true
      i = 0
      total = model.count
      query.find_each do |m|
        puts "#{i.to_s.rjust(6)} / #{total}  #{model} #{m.id}"
        client.index  index: model.index_name, type: model.name.downcase, id: m.id, body: m.as_indexed_json
        i += 1
      end
    end
  end

  desc 'Drop elasticsearch indexes'
  task :drop => :environment do
    [
      # Wip,
      User,
      Product
    ].each do |model|
      model.__elasticsearch__.client.indices.delete index: model.index_name rescue nil
    end
  end
end
