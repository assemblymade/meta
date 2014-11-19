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
     page_selection, user_filter, user_id_filter, mark_filter].compact
  end

  def state_filter
    case state
    when nil, 'open'
      Wip.open
    when 'progress'
      Wip.where(state: ['allocated', 'reviewing'])
    when 'reviewing'
      Wip.where(state: 'reviewing')
    when 'closed', 'resolved'
      Wip.closed
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
      # TODO: Backfill awards and swap with a simpler query
      Wip.joins(events: :event).
        where(events: { type: 'Event::Win' }).
        where(events_events: { user_id: user.id }).
        order('events.created_at DESC')
    when 'commented'
      user.wips_commented_on
    else # all
      Wip.all
    end
  end

  def user_id_filter
    if user_id_params.present?
      Wip.joins(:events).
        where(events: { user_id: user_id_params }).
        uniq
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

  def mark_filter
    return unless mark
    
    Wip.open.joins(:marks).where('marks.name = ?', mark)
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
      Wip.order('total_coins_cache DESC')
    when 'least_valuable'
      Wip.order('total_coins_cache ASC')
    when 'newest'
      Wip.order('wips.created_at DESC')
    when 'oldest'
      Wip.order('wips.created_at ASC')
    when 'recently_updated'
      Wip.order('wips.updated_at DESC')
    when 'least_recently_updated'
      Wip.order('wips.updated_at ASC')
    when 'priority'
      Wip.order('wips.multiplier DESC')
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

  def mark
    filters[:mark]
  end

  def user_params
    filters[:user]
  end

  def user_id_params
    filters[:user_id]
  end
end
