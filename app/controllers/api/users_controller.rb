module Api
  class UsersController < ApiController
    before_action :authenticate, :except => [:ownership, :info, :core]

    def show
      render json: current_user
    end

    def ownership
      @user = get_user
      balances = TransactionLogEntry.product_balances(@user).to_a
      r = balances.map{|a, b| {product: ProductShallowSerializer.new(Product.find(a)), coins: b} }
      render json: r
    end

    def info
      @user = get_user
      render json: @user, serializer: UserApiSerializer
    end

    def core
      @user = get_user
      respond_with(@user.core_on, each_serializer: ProductShallowSerializer)
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
