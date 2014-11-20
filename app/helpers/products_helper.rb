module ProductsHelper

  %w(
    assets
    products
    partners
    milestones
    activity
    chat
    dashboard
    discussions
    tasks
    posts
  ).each do |name|
    define_method("#{name}_controller?") { controller_name == name }
  end

  def product_code_wips_path(product)
    product_wips_path(product, deliverable: :code)
  end

  def product_copy_wips_path(product)
    product_wips_path(product, deliverable: :copy)
  end

  def product_design_wips_path(product)
    product_wips_path(product, deliverable: :design)
  end

  def new_bounty_props(product)
    {
      product: { name: @product.name },
      url: product_wips_path(@product),
      maxOffer: (6 * @product.average_bounty).round(-4),
      averageBounty: @product.average_bounty
    }
  end

  def product_membership_interests(product, with_defaults=false)
    existing_interests = Interest.
      joins(team_membership_interests: :team_membership).
      where('team_memberships.deleted_at is null').
      where('team_memberships.product_id = ?', product.id).distinct.map(&:slug)

    interests = if with_defaults
      existing_interests | Interest::DEFAULT_INTERESTS # union
    else
      existing_interests.empty? ? Interest::DEFAULT_INTERESTS : existing_interests
    end

    interests.sort
  end

  def open_tweet_popup_js
    text = 'hi'
    %Q{window.open(\\"https://twitter.com/intent/tweet?text=#{text}&url=\\" + window.location)}
  end

  def partner?(product)
    current_user && TransactionLogEntry.where(product_id: product.id).where(wallet_id: current_user.id).any?
  end

  def followers_sorted_by_coins(product, limit=10)
    User.joins(:watchings).
      joins('LEFT JOIN transaction_log_entries tle ON (tle.wallet_id = users.id AND tle.product_id = watchings.watchable_id)').
      where(watchings: { watchable_id: product.id }).
      group('users.id').
      order('SUM(cents) DESC NULLS LAST').
      limit(limit)
  end
end
