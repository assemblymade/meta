class PagesController < ApplicationController

  def tos
  end

  def home
    test = ab_test('signup_conversion_from_focus_homepage', 'focus labs', 'whale')
    if test == 'focus labs'
      render 'focus_home', layout: nil
    else
      render
    end
  end
end
