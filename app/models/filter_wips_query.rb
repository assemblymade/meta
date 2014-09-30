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
    [state_filter, deliverable_filter, project_filter, tag_filter, sort_order,
     page_selection, user_filter].compact
  end

  def state_filter
    case state
    when nil, 'open'
      Wip.open
    when 'progress'
      Wip.where(state: ['allocated', 'reviewing'])
    when 'reviewing'
      Wip.where(state: 'reviewing')
    when 'closed'
      Wip.where(state: 'resolved')
    else
      Wip.all
    end
  end

  def user_filter
    case user_params
    when 'started'
      user.wips
    when 'assigned'
      user.wips_working_on
    when 'following'
      user.wips_watched
    when 'awarded'
      user.wips_awarded_to
    when 'commented'
      user.wips_commented_on
    else # all
      Wip.all
    end
  end

  def deliverable_filter
    return unless deliverable

    Wip.where(deliverable: deliverable)
  end

  def project_filter
    return unless project

    Wip.open.joins(milestone_tasks: :milestone).
      where('milestones.number' => project)
  end

  def tag_filter
    return unless tag

    Wip.open.joins(:tags).where('wip_tags.name ilike ?', tag)
  end

  def bounty_postings_filter
    Wip.not_posted
  end

  def partners_filter
    return unless filters[:partner] == false

    Wip.where('wips.user_id = ?', user.id)
  end

  def sort_order
    case sort
    when 'most_valuable'
      Wip.order('(multiplier * votes_count) DESC')
    when 'least_valuable'
      Wip.order('(multiplier * votes_count) ASC')
    when 'newest'
      Wip.order('wips.created_at DESC')
    when 'oldest'
      Wip.order('wips.created_at ASC')
    when 'recently_updated'
      Wip.order('wips.updated_at DESC')
    when 'least_recently_updated'
      Wip.order('wips.updated_at ASC')
    when false
      Wip.all
    else #  (default)
      Wip.order('updated_at desc')
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

  def project
    filters[:project]
  end

  def sort
    filters[:sort]
  end

  def page
    filters[:page]
  end

  def tag
    filters[:tag]
  end

  def user_params
    filters[:user]
  end
end
