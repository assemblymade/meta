class Admin::LeaderboardController < AdminController
  def index
    counts = Activity.where(actor_type: 'User').
      group(:actor_id).
      order('count_all DESC').
      limit(200).
      count

    @data = counts.map do |user_id, count|
      user = User.find(user_id)

      {
        user: user,
        activity_count: count,
        daily_avg: count / ((Time.now - user.created_at) / 1.day),
        joined_at: user.created_at,
        karma_total: user.karma_total
      }.with_indifferent_access
    end

    case params[:sort]
    when 'daily_avg'
      @data = @data.sort_by { |x| -x[:daily_avg] }
    when 'joined_at'
      @data = @data.sort_by { |x| x[:joined_at] }
    end

    @data
  end
end
