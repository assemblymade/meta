class Newsletter < ActiveRecord::Base

  validates :subject, presence: true
  validates :body, presence: true

  scope :active, -> { where(cancelled_at: nil) }
  scope :unpublished, -> { where(published_at: nil) }
  scope :available, -> { active.unpublished.order(:created_at) }

  def published?
    !published_at.nil?
  end

  def publish!(users=[])
    email_to_users(users)
    update_attribute(:published_at, Time.now.utc)
  end

  def cancelled?
    !cancelled_at.nil?
  end

  def cancel!
    update_attribute(:cancelled_at, Time.now.utc)
  end

  def next_published_at
    published_at || Time.now.utc.next_week(:thursday)
  end

  def email_to_users(users)
    users.each {|user| DigestMailer.delay.weekly(user.id, id) }
  end

end
