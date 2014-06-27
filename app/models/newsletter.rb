class Newsletter < ActiveRecord::Base

  validates :subject, presence: true
  validates :body, presence: true

  scope :active, -> { where(cancelled_at: nil) }
  scope :unpublished, -> { active.where(published_at: nil) }

  def self.next_unpublished
    unpublished.order(:created_at).first
  end

  def published?
    !published_at.nil?
  end

  def publish!(users=[])
    send_email_to!(users)
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

  def send_email_to!(users)
    users.each {|user| NewsletterMailer.delay(queue: 'mailer').published(id, user.id) }
  end

end
