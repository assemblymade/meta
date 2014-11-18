class IdeaComment < ActiveRecord::Base
  belongs_to :idea, touch: true
  belongs_to :user
  validates :body, presence: true
end
