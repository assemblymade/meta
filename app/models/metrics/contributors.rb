module Metrics
  class Contributors
    def self.in_week(at)
      (-7..0).map do |i|
        day = at + i.days
        event_creators = events.
          where("date(events.created_at AT TIME ZONE 'PST') = ?", day).
          group('events.user_id').count.keys

        wip_creators = wips.
          where("date(wips.created_at AT TIME ZONE 'PST') = ?", day).
          group('wips.user_id').count.keys

        [day, (event_creators | wip_creators).size]
      end
    end

    def self.active_between(start_at, end_at)
      event_creators = events.
        where("events.created_at >= date(? AT TIME ZONE 'PST') and events.created_at <= date(? AT TIME ZONE 'PST')",
          start_at, end_at).
        group('events.user_id').count.keys

      wip_creators = wips.
        where("wips.created_at >= date(? AT TIME ZONE 'PST') and wips.created_at <= date(? AT TIME ZONE 'PST')",
          start_at, end_at).
        group('wips.user_id').count.keys

      (event_creators | wip_creators).size
    end

    def self.events
      Event.joins(:user).where('users.is_staff is false')
    end

    def self.wips
      Wip.joins(:user).where('users.is_staff is false').where('number > 0')
    end
  end
end
