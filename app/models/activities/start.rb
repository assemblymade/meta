module Activities
  class Start < Activity
    def stream_targets
      [actor, target.product]
    end

    def publishable
      true
    end
  end
end
