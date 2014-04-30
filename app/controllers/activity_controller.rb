class ActivityController < ApplicationController
  
  def index
    @stream_events = StreamEvent.visible.page(page)
    respond_to do |format|
      format.js   { render :layout => false }
      format.html
    end    
  end

  protected
  def page
    [params[:page].to_i, 1].max
  end
end
