module Api
  class UsersController < ApiController
    before_action :authenticate

    def show
      render json: current_user
    end

    def ownership
      render json: current_user, serializer: UserApiSerializer
    end

  end
end
