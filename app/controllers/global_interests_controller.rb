class GlobalInterestsController < ApplicationController
  respond_to :json
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

    respond_with global_interest
  end
end
