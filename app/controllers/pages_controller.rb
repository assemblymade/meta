class PagesController < ApplicationController

  def sabbaticals
  end

  def core_team
  end

  def tos
  end

  def home
    render 'focus_home', layout: nil
  end

end
