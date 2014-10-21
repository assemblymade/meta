class Admin::LeaderboardController < AdminController
  def index
    sql = "SELECT COUNT(*) AS activity_count, (SELECT users.username FROM users WHERE users.id = activities.actor_id) FROM activities WHERE activities.actor_type = 'User' GROUP BY actor_id ORDER BY activity_count DESC LIMIT 200"
    values = ActiveRecord::Base.connection.execute(sql).values
    @data = values.map do |v|
      { 'user' => user = User.where(username: v.last).first,
        'activity_count' => v.first,
        'daily_avg' => v.first.to_i / ((Time.now - user.created_at) / (60 * 60 * 24.0)),
        'joined_at' => user.created_at}
    end
    case params[:sort]
    when 'daily_avg'
      @data = @data.sort_by{|x| -x['daily_avg']}
    when 'joined_at'
      @data = @data.sort_by{|x| x['joined_at']}
    end
    @data
  end
end

