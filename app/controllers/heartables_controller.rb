class HeartablesController < ApplicationController
  before_action :authenticate_user!, except: [:hearts, :lovers]

  def index
    @hearts = Heart.includes(user).where(heartable_id: params[:heartable_id])

    render json: {
      hearts: ActiveModel::ArraySerializer.new(@hearts)
    }
  end

  def love
    p = heart_params
    heartable = p[:type].constantize.find(p[:id])

    previous_hearts = heartable.user.hearts_received

    @heart = heartable.hearts.create(user: current_user)
    if @heart.valid?
      TrackInfluenced.perform_async(
        current_user.id,
        @heart.created_at.to_i,
        'Heart',
        @heart.heartable.try(:target).try(:class).try(:name) || @heart.heartable_type,
        @heart.product.try(:id)
      )

      TrackHeartReceived.perform_async(
        heartable.user.id,
        @heart.created_at.to_i,
        @heart.heartable.try(:target).try(:class).try(:name) || @heart.heartable_type,
        @heart.product.try(:id)
      )

      PusherWorker.perform_async(heartable.user.pusher_channel, 'HEART_RECEIVED', {
          heartsCount: previous_hearts + 1
        }, socket_id: params[:socket_id])

      render json: {
        heartable_id: @heart.heartable_id,
        heartable_type: @heart.heartable_type,
        hearts_count: @heart.heartable.hearts_count,
      }
    else
      render status: :unprocessable_entity, json: @heart.errors
    end
  end

  def hearts
    @user_hearts = []
    if signed_in?
      @user_hearts = Heart.where(heartable_id: params[:heartable_ids]).
                           where(user_id: current_user.id)
    end

    @hearts = Heart.includes(:user).
                    where(heartable_id: params[:heartable_ids]).
                    select('distinct on (heartable_id) *')

    render json: {
      user_hearts: ActiveModel::ArraySerializer.new(@user_hearts),
      recent_hearts: ActiveModel::ArraySerializer.new(@hearts)
    }
  end

  def lovers
    @lovers = Heart.includes(:user).where(heartable_id: params[:heartable_id]).map(&:user)

    render json: {
      lovers: ActiveModel::ArraySerializer.new(@lovers)
    }
  end

  # private

  def heart_params
    params.permit(:type, :id)
  end
end
