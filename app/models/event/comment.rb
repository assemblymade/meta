class Event::Comment < Event
  include Versioning

  belongs_to :wip, touch: true, counter_cache: true

  validates :body, presence: true, length: { minimum: 2 }

  after_save :post_process
  after_save :consider_comment_a_check_in
  after_commit -> { track_activity }, on: :create

  def self.analytics_name
    'wip.commented'
  end

  def post_process
    add_backreferences
  end

  def add_backreferences
    TextFilters::UserMentionFilter.mentioned_usernames_in(body, wip) do |user, _|
      wip.watch!(user) unless user.nil?
    end

    TextFilters::ShortcutFilter.shortcuts_in(body) do |match, wip_number|
      wip = self.wip.product.wips.find_by(number: wip_number)
      if !wip.nil? && wip != self.wip
        wip.events << Event::CommentReference.new(user: user, event: self)
      end
    end
  end

  def consider_comment_a_check_in
    worker = Wip::Worker.where(user_id: user, wip_id: wip).first
    worker.checked_in! if worker
  end

  def track_activity
    StreamEvent.add_create_event!(actor: user, subject: self, target: wip)
  end

  def tippable?
    true
  end

  def awardable?
    wip.is_a?(Task)
  end

  def editable?
    true
  end

end
