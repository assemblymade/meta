module Activities
  class Comment < Activity
    validates :actor, presence: true
    validates :target, presence: true

    def subject
      target.wip
    end
  end
end
