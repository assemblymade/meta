class FilterWipsQuery
  attr_accessor :product_wips, :user, :filters

  def self.call(product_wips, user, filters)
    new(product_wips, user, filters).filter_wips
  end

  def initialize(product_wips, user, filters)
    self.product_wips = product_wips
    self.user = user
    self.filters = filters
  end

  def filter_wips
    apply_filters(product_wips_with_users)
  end

  def product_wips_with_users
    product_wips.includes(:user)
  end

  def apply_filters(query)
    filter_clauses.inject(query) do |query, clause|
      query.merge(clause)
    end
  end

  def filter_clauses
    [state_filter, deliverable_filter, sort_order, page_selection].compact
  end

  def state_filter
    return unless state

    if personally_allocated?
      user.wips_working_on
    else
      Wip.where(state: state)
    end
  end

  def deliverable_filter
    return unless deliverable

    Wip.where(deliverable: deliverable)
  end

  def sort_order
    case sort
    when 'created'
      Wip.order('wips.created_at DESC')
    when 'update'
      Wip.order('wips.updated_at DESC')
    else
      Wip.select('*, CASE WHEN promoted_at IS NULL THEN wips.votes_count ELSE wips.votes_count * 2 END AS promoted_score').
        order('promoted_score DESC, promoted_at IS NOT NULL DESC')
    end
  end

  def page_selection
    Wip.page(page)
  end

  def state
    filters[:state]
  end

  def deliverable
    filters[:deliverable]
  end

  def sort
    filters[:sort]
  end

  def page
    filters[:page]
  end

  def personally_allocated?
    state == 'personally_allocated' && user
  end
end
