class UpdateIdeaRankWorker
  include Sidekiq::Worker

  def perform(product_id)
    leaderboard = ::IdeaLeaderboard.new(Leaderboard.new($redis))

    product = Product.find(product_id)
    if product.approved? && !product.greenlit?
      leaderboard.add(product)
    else
      leaderboard.remove(product)
    end
  end
end
