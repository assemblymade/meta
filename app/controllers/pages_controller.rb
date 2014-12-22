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
    marks = Mark.where(name: mark_names)
    vector = marks.pluck(:id).map { |id| [id, 1] }
    vectors = [vector] + vector.map { |v| [v] }

    wip_vectors = QueryMarks.new.get_all_wip_vectors

    @task_groups = vectors.map do |vector|
      correlated_bounties = QueryMarks.new.user_bounties(vector, wip_vectors).sort_by(&:first).reverse
      marks = Mark.where(id: vector.map(&:first))
      bounties = correlated_bounties.take(3).map(&:last)

      TaskGroup.new(marks, bounties)
    end

    current_user.user_identity.marks << (Mark.where(name: mark_names) - current_user.user_identity.marks)
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
