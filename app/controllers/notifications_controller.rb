class NotificationsController < ApplicationController
  def index
    @stories = NewsFeed.new(current_user).page(params[:top_id])
    @users = @stories.map(&:activities).flatten.map(&:actor).flatten.uniq

    respond_to do |format|
      format.html

      format.json {
        render :json => {
          users: Hash[ActiveModel::ArraySerializer.new(@users).as_json.map{|u| [u[:id], u]}],
          stories: ActiveModel::ArraySerializer.new(
            @stories,
            scope: current_user,
            each_serializer: StorySerializer
          ).as_json
        }
      }
    end
  end
end
