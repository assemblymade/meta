class PostChatMessage < ApiWorker
  include Sidekiq::Worker

  def perform(product_slug, message)
    @product = Product.find_by(slug: product_slug)

    return false unless Activity.where(target_id: @product.id)
                                .where.not(type: 'Activities::Chat')
                                .where.not(type: 'Activities::FoundProduct')
                                .empty?

    @user = User.find_by(username: 'kernel')

    post "#{ENV['HUBOT_HOST']}/kernel",
      message: message,
      product: @product.slug
  end
end
