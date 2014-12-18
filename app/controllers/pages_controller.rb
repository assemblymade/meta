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

  def interests
  end

  def suggestions
    mark_names = params[:tags].map(&:downcase)
    current_user.user_identity.marks << (Mark.where(name: mark_names) - current_user.user_identity.marks)

    wip_vectors = QueryMarks.new.get_all_wip_vectors
    QueryMarks.new.assign_top_bounties_for_user(10, current_user, wip_vectors)

    @bounties = current_user.top_bountys.includes(:wip).map(&:wip)
  end
end
