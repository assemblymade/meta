class PagesController < ApplicationController

  def sabbaticals
  end

  def core_team
  end

  def tos
  end

  def home
    if signed_in? && current_user.staff?
      render 'focus_home', layout: nil
      return
    end
  end

end
