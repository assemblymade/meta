module Api
  class UsersController < ApiController
    before_action :authenticate

    def show
      render json: current_user
    end
  end
end
