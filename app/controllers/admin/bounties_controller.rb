class Admin::BountiesController < AdminController

  include BountyStatsHelper

  def index
    # TODO clean up: this code is really gross
    @created = created
    @created_c = created('core')
    @created_s = created('staff')
    @created_counts = [date_helper, @created,
                      @created_c,
                      @created_s].transpose
    @awarded_counts = [date_helper, awarded.zip(@created).map{|m| m.first / m.last},
                      awarded('core').zip(@created_c).map{|m| m.first / m.last},
                      awarded('staff').zip(@created_s).map{|m| m.first / m.last}].transpose
    @closed_counts = [date_helper, closed.zip(@created).map{|m| m.first / m.last},
                      closed('core').zip(@created_c).map{|m| m.first / m.last},
                      closed('staff').zip(@created_s).map{|m| m.first / m.last}].transpose
  end
end

