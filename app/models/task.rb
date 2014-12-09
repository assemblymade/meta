class Task < Wip
  has_many :deliverables, foreign_key: 'wip_id'
  alias_method :design_deliverables, :deliverables

  has_many :code_deliverables, foreign_key: 'wip_id'
  has_many :copy_deliverables, foreign_key: 'wip_id'
  has_many :offers, foreign_key: "bounty_id"
  has_many :wip_workers, class_name: 'Wip::Worker', foreign_key: 'wip_id', inverse_of: :wip
  has_many :votes, :as => :voteable, :after_add => :vote_added
  has_many :workers, :through => :wip_workers, :source => :user
  has_many :news_feed_items, as: :target

  validate :multiplier_not_changed

  before_save :update_trending_score

  scope :allocated,   -> { where(state: :allocated) }
  scope :hot,         -> { order(:trending_score => :desc) }
  scope :reviewing,   -> { where(state: :reviewing) }
  scope :won,         -> { joins(:awards) }
  scope :won_after,   -> (time) { won.where('awards.created_at >= ?', time) }
  scope :won_by,      -> (user) { won.where('awards.winner_id = ?', user.id) }
  scope :won_by_after, -> (user, time) { won.where('awards.winner_id = ?', user.id).where('awards.created_at >= ?', time) }

  AUTHOR_TIP = 0.05
  IN_PROGRESS = 'allocated'

  workflow_column :state
  workflow do
    state :open do
      event :allocate,    :transitions_to => :allocated
      event :award,       :transitions_to => :awarded
      event :close,       :transitions_to => :closed
      event :review_me,   :transitions_to => :reviewing
      event :unallocate,  :transitions_to => :open
    end
    state :allocated do
      event :allocate,    :transitions_to => :allocated
      event :unallocate,  :transitions_to => :open
      event :award,       :transitions_to => :awarded
      event :close,       :transitions_to => :resolved
      event :review_me,   :transitions_to => :reviewing
    end
    state :awarded do
      event :allocate,    :transitions_to => :awarded
      event :award,       :transitions_to => :awarded
      event :close,       :transitions_to => :resolved
      event :review_me,   :transitions_to => :reviewing
    end
    state :closed do
      event :unallocate,  :transitions_to => :open
      event :reopen,      :transitions_to => :open
    end
    state :reviewing do
      event :allocate,    :transitions_to => :reviewing
      event :unallocate,  :transitions_to => :open
      event :reject,      :transitions_to => :open
      event :award,       :transitions_to => :awarded
      event :close,       :transitions_to => :resolved
      event :review_me,   :transitions_to => :reviewing
    end
    state :resolved do
      event :reopen,      :transitions_to => :open
    end

    after_transition { notify_state_changed }
  end

  class << self
    def states
      workflow_spec.states.keys
    end

    def deliverable_types
      %w(design code copy other)
    end
  end

  def urgency
    Urgency.find(multiplier)
  end

  def urgency=(urgency)
    self.multiplier = urgency.multiplier
  end

  def awardable?
    true
  end

  def value
    Rails.cache.fetch([self, 'value']) do
      offers = Offer.where(bounty: self)

      # 1. reject invalid (old) offers

      latest_offers = {}
      offers.each do |offer|
        last_offer = latest_offers[offer.user]
        if last_offer.nil? || last_offer.created_at < offer.created_at
          latest_offers[offer.user] = offer
        end
      end

      offers = latest_offers.values

      # 2. figure out people's current ownership

      partners = offers.map {|o| Partner.new(o.product, o.user) }
      ownership = partners.each_with_object({}) do |partner, o|
        o[partner.wallet] = [0.0001, partner.ownership].max
      end

      # 3. figure out weighted average

      return 0 if offers.empty?

      sum = 0
      weight_sum = 0

      offers.each do |offer|
        sum += offer.amount * ownership[offer.user]
        weight_sum += ownership[offer.user]
      end

      if weight_sum > 0
        (sum / weight_sum).round
      else
        0
      end
    end
  end
  alias_method :calculate_current_value, :value

  def active_offers
    offers.group_by(&:user).flat_map { |u, o| o.sort_by(&:created_at).last }
  end

  def score
    votes_count * score_multiplier
  end

  def score_multiplier
    multiplier
  end

  def promoted?
    !promoted_at.nil?
  end

  def multiply!(actor, multiplier)
    raise ActiveRecord::RecordNotSaved unless actor.can? :multiply, self

    self.promoted_at = Time.current
    self.urgency = Urgency.find(multiplier)
    self.save!
    milestones.each(&:touch)
  end

  def can_vote?(user)
    votes.where(user: user).none?
  end

  def assigned_to?(worker)
    false if worker.nil?
    workers.include?(worker)
  end

  def lock_bounty!(worker)
    update(locked_at: Time.now, locked_by: worker.id)
  end

  def unlock_bounty!
    update(locked_at: nil, locked_by: nil)
  end

  def start_work!(worker)
    self.workers << worker unless self.workers.include?(worker)
    Analytics.track(user_id: worker.id, event: 'product.wip.start_work', properties: WipAnalyticsSerializer.new(self, scope: worker).as_json)
    allocate!(worker) unless self.workers.count > 1
    lock_bounty!(worker)
  end

  def stop_work!(worker)
    self.update(workers: [])
    unlock_bounty!
    update(state: 'open') if workers.size == 0
  end

  def allocate(worker)
    add_activity worker, Activities::Assign do
      add_event(::Event::Allocation.new(user: worker))
    end
  end

  def unallocate(reviewer, reason)
    StreamEvent.add_unallocated_event!(actor: reviewer, subject: self, target: product)

    add_event ::Event::Unallocation.new(user: reviewer, body: reason) do
      self.workers.delete_all
    end
  end

  def review_me(worker)
    start_work!(worker)

    add_activity worker, Activities::Post do
      add_event ::Event::ReviewReady.new(user: worker)
    end
  end

  def reject(reviewer)
    add_activity reviewer, Activities::Unassign do
      add_event ::Event::Rejection.new(user: reviewer) do
        self.workers.delete_all
      end
    end
  end

  def award(closer, winning_event)
    stop_work!(winning_event.user)

    minting = nil
    add_activity(closer, Activities::Award) do
      win = ::Event::Win.new(user: closer, event: winning_event)
      add_event(win) do
        award = self.awards.create!(
          awarder: closer,
          winner: winning_event.user,
          event: winning_event,
          wip: self
        )

        minting = TransactionLogEntry.minted!(nil, Time.current, product, award.id, self.value)

        milestones.each(&:touch)
      end
    end

    CoinsMinted.new.perform(minting.id) if minting
  end

  def work_submitted(submitter)
    review_me!(submitter) if can_review_me?
  end

  def submit_design!(attachment, submitter)
    add_activity submitter, Activities::Post do
      add_event (event = ::Event::DesignDeliverable.new(user: submitter, attachment: attachment)) do
        work_submitted(submitter)
        self.deliverables.create! attachment: attachment
      end
    end
  end

  def submit_copy!(copy_attributes, submitter)
    transaction do
      work_submitted(submitter)
      deliverable = self.copy_deliverables.create! copy_attributes.merge(user: submitter)

      add_activity submitter, Activities::Post do
        event = ::Event::CopyAdded.new(user: submitter, deliverable: deliverable)
        self.events << event
        event
      end
    end
  end

  def submit_code!(code_attributes, submitter)
    work = nil
    transaction do
      work_submitted(submitter)
      work = self.code_deliverables.build code_attributes.merge(user: submitter)
      add_activity submitter, Activities::Post do
        if work.save
          event = ::Event::CodeAdded.new(user: submitter, deliverable: work)
          self.events << event
          StreamEvent.add_work_event!(actor: submitter, subject: event, target: self)
          event
        else
          raise ActiveRecord::Rollback
        end
      end
    end
    work
  end

  def current_posting
    postings.first
  end

  def winners
    awards.map(&:winner).uniq
  end

  def open?
    closed_at.nil?
  end

  # trending
  EPOCH = 1134028003 # first WIP

  def update_trending_score
    self.trending_score = calculate_trending_score
  end

  def trending_half_life
    3.days
  end

  def trending_value
    score
  end

  def trending_value_bump
    Math.log10([trending_value, 1].max) * 2
  end

  def trending_time_bump
    created_time_value = created_at || Time.now
    comment_time_value = events.average("extract ('epoch' from created_at)") || created_time_value

    (((created_time_value.to_i + comment_time_value.to_i).to_f / 2) - EPOCH) / trending_half_life
  end

  def calculate_trending_score
    value_bump = trending_value_bump
    time_bump = trending_time_bump

    order = (value_bump + time_bump)

    val = (order.round(7) * (10**7)).to_i
    # puts "##{number} trending_value:#{trending_value} value_bump:#{"%.02f" % value_bump} + time_bump:#{"%.02f" % time_bump} = #{"%.04f" % order}"

    val
  end

  def contracts
    WipContracts.new(self)
  end

  def multiplier_not_changed
    if multiplier_changed? && !open?
      errors.add(:multiplier, "cannot be changed on closed Bounty")
    end
  end

  def update_coins_cache!
    contracts.tap do |c|
      self.update!(
        total_coins_cache: c.total_cents,
        earnable_coins_cache: c.earnable_cents
      )
    end
  end

  def most_recent_other_wip_worker(user)
    return unless user
    wip_workers.where.not(user_id: user.id).order('created_at DESC').first
  end
end
