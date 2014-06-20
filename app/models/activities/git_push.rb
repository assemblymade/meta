module Activities
  class GitPush < Activity
    def stream_targets
      [actor, target]
    end
  end
end
