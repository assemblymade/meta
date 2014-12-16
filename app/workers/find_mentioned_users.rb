class FindMentionedUsers
  def perform(text, product=nil)
    users = []
    TextFilters::UserMentionFilter.mentioned_usernames_in(text, product) do |username, user|
      if user
        users << user if user
      end
    end

    users.flatten.uniq
  end
end
