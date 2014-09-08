class ChatRoom < ActiveRecord::Base
  belongs_to :product # could be null for a global chat room
  belongs_to :wip

  validates :slug, presence: true
  validates :wip, presence: true

  default_scope -> { where(deleted_at: nil) }

  def self.general
    find_by(slug: 'general')
  end

  def key
    "chat_#{id}"
  end

  def to_param
    slug
  end
end
