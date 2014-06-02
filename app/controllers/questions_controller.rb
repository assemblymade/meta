class QuestionsController < ApplicationController

  def index
    @group = params.fetch(:group)
    @questions = Question.by_group(@group)
    @groups = Question::GROUPS
  end

end
