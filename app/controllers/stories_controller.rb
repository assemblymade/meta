class StoriesController < ApplicationController
  def show
    @story = Story.find(params[:id])

    redirect_to @story.subject.url_params
  end
end
