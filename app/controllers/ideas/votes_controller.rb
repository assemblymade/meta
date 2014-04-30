class Ideas::VotesController < ApplicationController
  respond_to :html, :json

  before_action :authenticate_user!, :only => [:create, :destroy]
  after_action :congratulate_first_signup, :only => [:create]
  
  def create
    finished(SplitTests::VOTE_UP)
    @product = Product.find_by_id_or_slug!(params[:id])
    @product.votes.create!(user: current_user, ip: request.remote_ip)
    if !current_user.staff?
      track_event 'product.sign-up', ProductAnalyticsSerializer.new(@product).as_json  
    end
    
    respond_with do |format|
      format.json { render json: { count: @product.votes.count } }
      format.html { redirect_to product_path(@product) }
    end
  end

  protected
  def congratulate_first_signup
    if owner_and_now_new_user_signed_up = (@product.votes.count == 2)
      ProductMailer.delay.congrats_on_your_first_user(@product.id)
    end
  end
  
end
