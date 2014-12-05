class StoriesController < ApplicationController
  def show
    @story = Story.find(params[:id])

    activity = @story.activities.first
    target_entity = activity.target_entity
    redirect_to [target_entity.product, target_entity]
  end
end
