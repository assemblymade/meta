class Indexer
  include Sidekiq::Worker
  sidekiq_options queue: 'elasticsearch', retry: false

  def perform(operation, record_type, record_id)
    klass = record_type.constantize
    case operation.to_s
      when /index/
        record = klass.find(record_id)
        return if record.respond_to?(:chat?) && record.chat?
        Elasticsearch::Model.client.index  index: klass.index_name, type: klass.name.downcase, id: record.id, body: record.as_indexed_json
      when /delete/
        Elasticsearch::Model.client.delete index: klass.index_name, type: klass.name.downcase, id: record_id
      else raise ArgumentError, "Unknown operation '#{operation}'"
    end
  end
end
