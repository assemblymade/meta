class EmailLog < ActiveRecord::Base
  belongs_to :user

  scope :sent_to, ->(user, key) { where(user_id: user.id, key: key) }

  def self.log_send(user, key, params={})
    EmailLog.create!(user: user, key: key, params: params)
    yield if block_given?
  end
end
