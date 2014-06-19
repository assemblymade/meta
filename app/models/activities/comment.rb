module Activities
  class Comment < Activity
    def stream_targets
      [actor, target.product]
    end
  end
end
