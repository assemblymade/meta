class PostChatMessage < ApiWorker
  include Sidekiq::Worker

  def perform(product_slug, message, check_for_activity=true)
    @product = Product.find_by!(slug: product_slug)

    if check_for_activity
      # TODO: Double-check this query, make it more efficient
      return false unless Activity.where(target_id: @product.id)
                                  .where.not(type: 'Activities::Chat')
                                  .where.not(type: 'Activities::Found')
                                  .empty?
    end

    @user = User.find_by(username: 'kernel')

    post "#{ENV['HUBOT_HOST']}/hubot/asm",
      message: message,
      product: @product.slug
  end
end
