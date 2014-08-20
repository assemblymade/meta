module Activities
  class Chat < Activity
    def stream_targets
      [actor, target.product]
    end

    def publishable
      true
    end
  end
end
