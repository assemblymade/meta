class Products::DashboardController < ApplicationController
  before_action :set_product

  def index
    @status_update = status_update && status_update.decorate
    @stream_events = @product.stream_events.page(page)
    respond_to do |format|
      format.js   { render :layout => false }
      format.html
    end
  end
  
  def status_update
    @product.status_updates.first
  end

  protected
  def page
    [params[:page].to_i, 1].max
  end
end
