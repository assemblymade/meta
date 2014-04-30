class PagesController < ApplicationController

  def show
    render :action => params[:page]
  end

  def sabbaticals
    @upgrade_stylesheet = true
  end

  def core_team
  end

  def tos
    @upgrade_stylesheet = true
  end

end
