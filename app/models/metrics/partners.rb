module Metrics
  class Partners
    def self.in_week(at)
      (-7..0).map do |i|
        day = at + i.days
        tasks = Task.won.
          joins(winning_event: :user).
          where('is_staff is false').
          where("date(closed_at AT TIME ZONE 'PST') = ?", day).
          map{|t| t.winning_event.user.username }.uniq.size

        [day, tasks]
      end
    end

    def self.active_between(start_at, end_at)
      tasks = Task.won.
        joins(winning_event: :user).
        where('is_staff is false').
        where("events.created_at >= date(? AT TIME ZONE 'PST') and events.created_at <= date(? AT TIME ZONE 'PST')",
          start_at, end_at).
        map{|t| t.winning_event.user.username }.uniq.size
    end
  end
end