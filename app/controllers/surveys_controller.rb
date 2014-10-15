class SurveysController < ApplicationController

  before_action :authenticate_user!

  def new
  end

  def create
    permitted_params = user_params
    permitted_params[:platforms].reject!(&:blank?) if permitted_params[:platforms]
    current_user.update(permitted_params)
    redirect_to action: :show
  end

  def show
  end

  # private

  def user_params
    params.require(:user).
      permit(:most_important_quality, :how_much_time, :previous_experience, interested_tags: [], platforms: [])
  end

end
