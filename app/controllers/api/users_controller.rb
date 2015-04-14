module Api
  class UsersController < ApiController
    before_action :authenticate, :except => [:ownership, :info, :core]

    def show
      render json: current_user
    end

    def ownership
      @user = get_user
      render json: @user, serializer: PartnerSerializer
    end

    def info
      @user = get_user
      render json: @user, serializer: UserApiSerializer
    end

    def core
      @user = get_user
      render json: @user, serializer: UserCoreApiSerializer
    end

    def get_user
      @user = User.find_by(id: params[:user_id])
      if !@user
        @user = User.find_by(username: params[:user_id])
      end
      @user
    end

  end
end
