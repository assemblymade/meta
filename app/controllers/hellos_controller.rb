class HellosController < ApplicationController
  def show
    @user = User.find_by!(username: params[:id])
    @news_feed_item = NewsFeedItem.find_by(target: @user)
  end
end
