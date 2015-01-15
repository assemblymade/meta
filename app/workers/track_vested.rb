class TrackVested
  include Sidekiq::Worker
  sidekiq_options queue: 'analytics'

  EVENT_NAME = (ENV['METRIC_VESTED'] || 'vested')

  def perform(user_id, product_id, timestamp)
    user = User.find(user_id)
    return if user.staff?

    product = Product.find(product_id)

    time = Time.parse(timestamp)

    Analytics.track(
      user_id: user.id,
      event: 'vested',
      timestamp: time,
      properties: {
        product_id: product.id,
        product_slug: product.slug,
        product_virgin: product_wins(time, user, product_id).count == 0,
        platform_virgin: platform_wins(time, user).count == 0
      }
    )
  end

  def product_wins(before, user, product_id)
    platform_wins(before, user).where(product_id: product_id)
  end

  def platform_wins(before, user)
    user.wips_won.where('closed_at < ?', before)
  end
end
