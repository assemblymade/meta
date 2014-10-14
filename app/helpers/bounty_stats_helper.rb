module BountyStatsHelper

  require 'date'

  def created(filter = nil, week_range = 1, history = 4)
    stat_helper('created', week_range, history, filter)
  end

  def awarded(filter = nil, week_range = 1, history = 4)
    stat_helper('awarded', week_range, history, filter)
  end

  def closed(filter = nil, week_range = 1, history = 4)
    stat_helper('closed', week_range, history, filter)
  end

  # TODO: this is not DRY
  def date_helper(week_range = 1, history = 4)
    dates = []
    weeks = history.downto(-1).to_a
    ceiling = weeks.max
    weeks.each do |d|
      silence_stream(STDOUT) do
        if d == -1
          # the current week
          startt = week_range == 1 ? Date.today.beginning_of_week : week_range.week.ago.beginning_of_week
        else
          startt = (d+week_range).week.ago.beginning_of_week
        end
        dates << startt
      end
    end
    dates
  end

  private

  def filtered_query(query, filter = nil)
    query = query.select{|t| t.user.username != 'kernel' &&
                     t.product.slug != 'meta'}
    if filter == 'core'
      query = query.select{|t| t.product.core_team?(t.user)}
    elsif filter == 'staff'
      query = query.select{|t| t.user.staff?}
    end
    query
  end


  # TODO: clean up; this code is hella gross
  # need to cache...only the last row will be new
  def stat_helper(status, week_range = 1, history = 4, filter = nil)
    results = []
    dates = []
    weeks = history.downto(-1).to_a
    ceiling = weeks.max

    weeks.each do |d|
      silence_stream(STDOUT) do
        if d == -1
          # the current week
          startt = week_range == 1 ? Date.today.beginning_of_week : week_range.week.ago.beginning_of_week
          endt = Time.now
        else
          startt = (d+week_range).week.ago.beginning_of_week
          endt = d.week.ago.beginning_of_week
        end

        query = Task.where(created_at: startt..endt)
                    
        if status == 'awarded'
          query = query.where(state: :awarded)
        elsif status == 'closed'
          query = query.where(state: :resolved)
        end
        dates << startt
        results << filtered_query(query, filter).count.to_f
      end
    end
    results
  end

end