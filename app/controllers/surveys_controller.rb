class SurveysController < ApplicationController

  before_action :authenticate_user!

  def new
  end

  def create
    permitted_params = user_params[:user]

    current_user.update(permitted_params) if permitted_params

    # if current_user.interested_tags.any?
    #   redirect_to(action: :show)
    # else
    redirect_to(discover_path)
    # end
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
    params.permit(:user => [interested_tags: []])
  end

end
