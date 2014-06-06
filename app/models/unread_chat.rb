class UnreadChat
  def self.for(user)
    unread_chats = ReadRaptorClient.new.unread_articles(user.id, :chat)

    entities = ReadRaptorSerializer.deserialize(unread_chats)
    entities = entities.group_by do |o|
      o.try(:product) || o.try(:wip).try(:product)
    end

    entries = (user.recent_products || []).take(7).map.with_index do |product, i|
      product_events = entities[product] || []
      {
        product: ProductSerializer.new(product).as_json,
        count: product_events.size,
        entities: product_events.map{|e| [e.id, e.number] },
        index: i
      }
    end
  end
end