class TrackBountyAwarded < ActiveJob::Base
  queue_as :analytics

  def perform(bounty_id)
    bounty = Task.find(bounty_id)
    Analytics.track(
      user_id: bounty.winner.id,
      event: 'bounty.awarded',
      timestamp: bounty.closed_at,
      properties: {
        product_id: bounty.product.id,
        product_slug: bounty.product.slug,
        product_virgin: product_wins(bounty.closed_at, bounty.winner, bounty.product_id).count == 0,
        platform_virgin: platform_wins(bounty.closed_at, bounty.winner).count == 0
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
