module Activities
  class Start < Activity
    def stream_targets
      [actor, target.product]
    end
  end
end
