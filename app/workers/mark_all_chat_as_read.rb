class MarkAllChatAsRead
  include Sidekiq::Worker

  def perform(user_id, product_id)
    @user = User.find(user_id)
    @product = Product.find(product_id)

    ReadRaptorSerializer.serialize_entities(unread_product_entities, :chat).each do |id|
      client.get(ReadraptorTracker.new(id, @user.id).url)
    end

    PusherWorker.perform_async("@#{@user.username}", 'unread.updated', {})
  end

  def unread_product_entities
    @unread_product_entities ||= begin
      unread_chat_entities.select do |o|
        product_id = o.try(:product_id) || o.try(:wip).try(:product_id)
        @product.id == product_id
      end
    end
  end

  def unread_chat_entities
    @unread_chat_entities ||= ReadRaptorSerializer.deserialize(
      client.unread_articles(@user.id, :chat)
    )
  end

  def client
    @client ||= ReadRaptorClient.new
  end
end