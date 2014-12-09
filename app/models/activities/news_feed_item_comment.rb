module Activities
  class NewsFeedItemComment < Activity
    def publishable
      true
    end

    def verb
      'Comment'
    end
  end
end
