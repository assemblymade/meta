module Metrics
  class Partners
    def self.in_week(at)
      (-7..0).map do |i|
        day = at + i.days
        builders = Task.won.
          joins(awards: :winner).
          where('is_staff is false').
          where("date(closed_at AT TIME ZONE 'PST') = ?", day).
          map{|t| t.winners.map(&:username) }.flatten.uniq

        tippees = Tip.joins(:to).
          where('is_staff is false').
          where("date(tips.created_at AT TIME ZONE 'PST') = ?", day).
          map{|t| t.to.username }.uniq

        partners = (builders | tippees).size

        [day, partners]
      end
    end

    def self.active_between(start_at, end_at)
      builders = Task.won.
        joins(:events).
        joins(awards: :winner).
        where('is_staff is false').
        where("events.created_at >= date(? AT TIME ZONE 'PST') and events.created_at <= date(? AT TIME ZONE 'PST')",
          start_at, end_at).
        map{|t| t.winners.map(&:username) }.flatten.uniq

      tippees = Tip.joins(:to).
        where('is_staff is false').
        where("tips.created_at >= date(? AT TIME ZONE 'PST') and tips.created_at <= date(? AT TIME ZONE 'PST')",
          start_at, end_at).
        map{|t| t.to.username }.uniq

      (builders | tippees).size
    end
  end
end
