module Segment
  class Contributor
    def contains?(user)
      return false unless user

      Wip.opened_by(user).any? ||
        Task.won_by(user).any?  ||
        user_comments_count_gte(user, 3)
    end

    # private

    def user_comments_count_gte(user, count)
      Wip.joins(:events).where('events.type = ?', 'Event::Comment').where('events.user_id = ?', user.id).size >= count
    end
  end
end
