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
    jobs
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

end
