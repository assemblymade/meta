module Metrics
  class Contributors
    def self.in_week(at)
      (-7..0).map do |i|
        day = at + i.days
        events = Event.joins(:user).
          where('is_staff is false').
          where("date(events.created_at AT TIME ZONE 'PST') = ?", day).
          group('events.user_id').count.count

        wips = Wip.joins(:user).
          where('is_staff is false').
          where("date(wips.created_at AT TIME ZONE 'PST') = ?", day).
          group('wips.user_id').count.count

        [day, events + wips]
      end
    end

    def self.active_between(start_at, end_at)
      events = Event.joins(:user).
        where('users.is_staff is false').
        where("events.created_at >= date(? AT TIME ZONE 'PST') and events.created_at <= date(? AT TIME ZONE 'PST')",
          start_at, end_at).
        group('events.user_id').count.count

      wips = Wip.joins(:user).
        where('users.is_staff is false').
        where("wips.created_at >= date(? AT TIME ZONE 'PST') and wips.created_at <= date(? AT TIME ZONE 'PST')",
          start_at, end_at).
        group('wips.user_id').count.count

      events + wips
    end
  end
end