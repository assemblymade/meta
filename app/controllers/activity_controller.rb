class ActivityController < ApplicationController

  def show
    # this gets called to fetch an activity after it has been pushed into the browser. The fetch
    # is needed to generate the read raptor tracking id
    @activity = Activity.find(params[:id])
    render json: @activity, serializer: ActivitySerializer
  end

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
