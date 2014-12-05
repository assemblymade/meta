class StoriesController < ApplicationController
  def show
    @story = Story.find(params[:id])

    activity = @story.activities.first
    target_entity = (activity.subject_type == 'Event' || 'NewsFeedItemComment') ? activity.target : activity.subject
    redirect_to [target_entity.product, target_entity]
  end
end
