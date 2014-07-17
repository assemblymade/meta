class PostChatMessage < ApiWorker
  include Sidekiq::Worker

  def perform(product_slug, message)
    @product = Product.find_by(slug: product_slug)

    return false unless Activity.where(target_id: @product.id)
                                .where.not(type: 'Activities::Chat')
                                .where.not(type: 'Activities::FoundProduct')
                                .empty?

    @user = User.find_by(username: 'kernel')

    post Rails.application.routes.url_helpers.api_product_chat_comments_path(@product),
      message: message
  end
end
