module Activities
  class Chat < Activity
    def stream_targets
      [actor, target.product]
    end
  end
end
