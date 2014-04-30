require 'activerecord/uuid'

class StatusUpdate < ActiveRecord::Base
  include ActiveRecord::UUID
  extend FriendlyId


  belongs_to :product
  belongs_to :user

  default_scope ->{ order(:created_at => :desc) }

  validates :body, presence: true, length: { minimum: 2 }

  after_create :notify_followers

  friendly_id :title, use: :slugged

  def notify_followers
    product.watchers.reject {|user| user.mail_never? }.each do |user|
      ProductMailer.delay_for(2.seconds).status_update(user.id, self.id)
    end
  end

end
