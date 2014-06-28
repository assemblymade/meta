class Task < Wip
  belongs_to :winning_event, class_name: 'Event'

  has_many :deliverables, foreign_key: 'wip_id'
  alias_method :design_deliverables, :deliverables

  has_many :code_deliverables, foreign_key: 'wip_id'
  has_many :copy_deliverables, foreign_key: 'wip_id'
  has_many :wip_workers, class_name: 'Wip::Worker', foreign_key: 'wip_id', inverse_of: :wip
  has_many :votes, :as => :voteable, :after_add => :vote_added
  has_many :workers, :through => :wip_workers, :source => :user

  validates :deliverable, presence: true
  validates :multiplier, inclusion: { in: Urgency.multipliers }
  validate :multiplier_not_changed

  before_save :update_trending_score

  scope :allocated,   -> { where(state: :allocated) }
  scope :hot,         -> { order(:trending_score => :desc) }
  scope :reviewing,   -> { where(state: :reviewing) }
  scope :won,         -> { joins(:winning_event) }
  scope :won_after,   ->(time) { won.where('closed_at >= ?', time) }
  scope :won_by,      ->(user) { won.where('events.user_id = ?', user.id) }

  IN_PROGRESS = 'allocated'

  workflow_column :state
  workflow do
    state :open do
      event :allocate,    :transitions_to => :allocated
      event :award,       :transitions_to => :resolved
      event :close,       :transitions_to => :resolved
      event :review_me,   :transitions_to => :reviewing
      event :unallocate,  :transitions_to => :open
    end
    state :allocated do
      event :unallocate,  :transitions_to => :open
      event :award,       :transitions_to => :resolved
      event :close,       :transitions_to => :resolved
      event :review_me,   :transitions_to => :reviewing
    end
    state :reviewing do
      event :unallocate,  :transitions_to => :open
      event :reject,      :transitions_to => :open
      event :award,       :transitions_to => :resolved
      event :close,       :transitions_to => :resolved
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

  def upvotable?
    true
  end

  def downvotable?
    open?
  end

  def upvote!(user, ip)
    votes.create!(user: user, ip: ip)

    TransactionLogEntry.voted!(Time.current, product, self.id, user.id, 1)
  end

  def score
    votes_count * score_multiplier
  end

  def score_multiplier
    multiplier
  end

  def has_user_voted?(user)
    Vote.voted?(user, self)
  end

  def promoted?
    !promoted_at.nil?
  end

  def multiply!(actor, multiplier)
    raise ActiveRecord::RecordNotSaved unless actor.can? :multiply, self

    self.promoted_at = Time.current
    self.urgency = Urgency.find(multiplier)
    self.save!
    TransactionLogEntry.multiplied!(Time.current, product, self.id, user.id, multiplier)
    milestones.each(&:touch)
  end

  def can_vote?(user)
    votes.where(user: user).none?
  end

  def start_work!(worker)
    self.workers << worker
    allocate!(worker) unless self.workers.count > 1
  end

  def stop_work!(worker)
    self.workers -= [worker]
    update_attributes(state: 'open') if workers.size == 0
  end

  def allocate(worker)
    StreamEvent.add_allocated_event!(actor: worker, subject: self, target: product)

    add_event ::Event::Allocation.new(user: worker)
  end

  def unallocate(reviewer, reason)
    StreamEvent.add_unallocated_event!(actor: reviewer, subject: self, target: product)

    add_event ::Event::Unallocation.new(user: reviewer, body: reason) do
      self.workers.delete_all
    end
  end

  def review_me(worker)
    StreamEvent.add_reviewable_event!(actor: worker, subject: self, target: product)

    add_event ::Event::ReviewReady.new(user: worker)
  end

  def reject(reviewer, reason)
    add_event ::Event::Rejection.new(user: reviewer, body: reason) do
      self.workers.delete_all
    end
  end

  def award(closer, winning_event)
    add_event (win = ::Event::Win.new(user: closer, event: winning_event)) do
      StreamEvent.add_win_event!(actor: winning_event.user, subject: win, target: self)

      set_closed(closer)
      self.winning_event = winning_event
      TransactionLogEntry.validated!(Time.current, product, self.id, closer.id, winning_event.user.id)
      milestones.each(&:touch)
    end
  end

  def work_submitted(submitter)
    review_me!(submitter) if can_review_me?
  end

  def submit_design!(attachment, submitter)
    add_event (event = ::Event::DesignDeliverable.new(user: submitter, attachment: attachment)) do
      work_submitted(submitter)
      self.deliverables.create! attachment: attachment
      StreamEvent.add_work_event!(actor: submitter, subject: event, target: self)
    end
  end

  def submit_copy!(copy_attributes, submitter)
    transaction do
      work_submitted(submitter)
      deliverable = self.copy_deliverables.create! copy_attributes.merge(user: submitter)
      self.events << (event = ::Event::CopyAdded.new(user: submitter, deliverable: deliverable))
      StreamEvent.add_work_event!(actor: submitter, subject: event, target: self)
    end
  end

  def submit_code!(code_attributes, submitter)
    work = nil
    transaction do
      work_submitted(submitter)
      work = self.code_deliverables.build code_attributes.merge(user: submitter)
      if work.save
        self.events << (event = ::Event::CodeAdded.new(user: submitter, deliverable: work))
        StreamEvent.add_work_event!(actor: submitter, subject: event, target: self)
      else
        raise ActiveRecord::Rollback
      end
    end
    work
  end

  def winner
    winning_event and winning_event.user
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

  def bounty
    Bounty.new(self)
  end

  def multiplier_not_changed
    if multiplier_changed? && !open?
      errors.add(:multiplier, "cannot be changed on closed Bounty")
    end
  end

end
