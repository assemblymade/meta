class Admin::KarmaController < AdminController

  USERS_TO_DISPLAY = 200

  def index
    users = Karma::Kalkulate.new.top_users(200)
    @top_users = []
    users.each do |u|
      username = User.find_by(id: u[0]).username
      @top_users.append( [username, u[1]] )
    end

  end
end
