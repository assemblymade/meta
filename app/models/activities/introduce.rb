module Activities
  class Introduce < Activity
    def publishable
      true
    end

    def target_entity
      target
    end
  end
end
