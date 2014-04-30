class TagsController < ApplicationController
  def follow
    Wip::Tag.find_by!(name: params[:tag_id]).follow! current_user
    render nothing: true, status: 200
  end

  def unfollow
    Wip::Tag.find_by!(name: params[:tag_id]).unfollow! current_user
    render nothing: true, status: 200
  end
end