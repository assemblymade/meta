class HotBountiesController < ApplicationController
  def show
    @bounties = HotBounty.new.sort_best_bounties(30, 30.days.ago)
  end
end
