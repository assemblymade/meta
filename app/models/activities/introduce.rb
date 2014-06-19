module Activities
  class Introduce < Activity
    def stream_targets
      [actor, product]
    end

    def product
      target.try(:object) || target
    end
  end
end
