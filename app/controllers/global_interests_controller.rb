class GlobalInterestsController < ApplicationController
  respond_to :json, :html
  before_action :authenticate_user!

  INTEREST_WHITELIST = ["design", "frontend", "backend", "marketing"]

  def toggle
    interest = params[:interest]

    return respond_with :nothing, status: 403 if !INTEREST_WHITELIST.include?(interest)

    if global_interest = GlobalInterest.find_by(user: current_user)
      global_interest.attributes[interest] ?
        global_interest.update_attributes("#{interest}" => nil) :
        global_interest.update_attributes("#{interest}" => Time.now)
    else
      global_interest = GlobalInterest.create!(:user => current_user, "#{interest}" => Time.now)
    end

    respond_to do |format|
      format.json { render json: global_interest, status: 201 }
      format.html { redirect_to root_path }
    end
  end
end
