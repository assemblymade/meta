class SurveysController < ApplicationController

  before_action :authenticate_user!

  def new
  end

  def create
    permitted_params = user_params
    permitted_params[:platforms].reject!(&:blank?) if permitted_params[:platforms]
    current_user.update(permitted_params)

    if current_user.interested_tags.any?
      redirect_to(action: :show)
    else
      redirect_to(discover_path)
    end
  end

  def show
    @interesting_products = Product.joins(wips: :tags).
      where(flagged_at: nil).
      where(state: ['greenlit', 'profitable']).
      where(wip_tags: { name: current_user.interested_tags }).
      group('products.id')
  end

  # private

  def user_params
    params.require(:user).
      permit(:most_important_quality, :how_much_time, :previous_experience, interested_tags: [], platforms: [])
  end

end
