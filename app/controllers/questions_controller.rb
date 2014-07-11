class QuestionsController < ApplicationController

  def index
    @faq_groups = FaqGroup.all
    @faq_group = FaqGroup.find_by_slug!(params.fetch(:group))
  end

end
