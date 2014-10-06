class SurveysController < ApplicationController

  before_action :authenticate_user!

  def new
  end

  def create
    current_user.update(
      interested_tags: user_params.fetch(:interested_tags),
      most_important_quality: user_params[:most_important_quality],
      how_much_time: user_params[:how_much_time],
      previous_experience: user_params[:previous_experience],
      platforms: user_params[:platforms]
    )
    redirect_to action: :show
  end

  def show
  end

  # private

  def user_params
    params.require(:user)
  end

end
