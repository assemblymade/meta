class Message < ActiveRecord::Base
  belongs_to :author, class_name: 'User'

  validates :author, presence: true
  validates :body, presence: true
end
