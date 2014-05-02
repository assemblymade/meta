class QuestionsController < ApplicationController

  def index
    @group = params.fetch(:group)
    @groups = Question::GROUPS.keys
    @questions = Question.by_group(@group)
  end

protected

  def upgrade_stylesheet?
    true
  end

end
