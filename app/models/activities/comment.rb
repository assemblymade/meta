module Activities
  class Comment < Activity
    validates :actor, presence: true
    validates :target, presence: true
  end
end
