class Indexer
  include Sidekiq::Worker
  sidekiq_options queue: 'elasticsearch', retry: false

  def perform(operation, record_id)
    case operation.to_s
      when /index/
        record = Product.find(record_id)
        Elasticsearch::Model.client.index  index: 'products', type: 'product', id: record.id, body: record.as_indexed_json
      when /delete/
        Elasticsearch::Model.client.delete index: 'products', type: 'product', id: record_id
      else raise ArgumentError, "Unknown operation '#{operation}'"
    end
  end
end