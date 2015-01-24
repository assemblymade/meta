class PagesController < ApplicationController

  def sabbaticals
  end

  def core_team
  end

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

class TaskGroup < Struct.new(:marks, :tasks)
  def title
    if marks.one?
      "Because you selected \"#{marks.first.name.upcase}\""
    else
      "Special for you"
    end
  end
end
