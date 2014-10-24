class Admin::BountiesController < AdminController

  include BountyStatsHelper
  require 'date'

  def index
    # TODO clean up: this code is really gross
    @avg_bounty_age = avg_bounty_lifespan
    @avg_bounty_last_week = avg_bounty_lifespan(1.week.ago.beginning_of_week, Date.today.beginning_of_week)

    @history = !!(params[:weeks] =~ /\A[-+]?[0-9]+\z/) ? params[:weeks].to_i : 4

    @created = created(nil, @history)
    @created_c = created('core', @history)
    @created_s = created('staff', @history)
    @created_n = created('noncore', @history)

    @created_counts = [date_helper(@history), 
                      @created,
                      @created_c,
                      @created_n,
                      @created_s].transpose
    @awarded_counts = [date_helper(@history), 
                      awarded(nil, @history).zip(@created).map{|m| m.first / m.last},
                      awarded('core', @history).zip(@created_c).map{|m| m.first / m.last},
                      awarded('noncore', @history).zip(@created_n).map{|m| m.first / m.last},
                      awarded('staff', @history).zip(@created_s).map{|m| m.first / m.last}].transpose
    @closed_counts = [date_helper(@history), 
                      closed(nil, @history).zip(@created).map{|m| m.first / m.last},
                      closed('core', @history).zip(@created_c).map{|m| m.first / m.last},
                      closed('noncore', @history).zip(@created_n).map{|m| m.first / m.last},
                      closed('staff', @history).zip(@created_s).map{|m| m.first / m.last}].transpose

    respond_to do |format|
      format.html
      format.json {render json: [@created_counts, @awarded_counts, @closed_counts]}
    end
  end
end

