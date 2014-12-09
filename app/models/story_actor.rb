# This groups actors into each Story.
class StoryActor < ActiveRecord::Base
  belongs_to :story
  belongs_to :user

  validates :story, presence: true
  validates :user, presence: true
end
