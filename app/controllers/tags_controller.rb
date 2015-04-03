class TagsController < ApplicationController

  def find_tag_by_id(params)
    Wip::Tag.find_by!(name: params[:tag_id])
  end

  def follow
    find_tag_by_id(params).follow! current_user
    render nothing: true, status: 200
  end

  def unfollow
    find_tag_by_id(params).unfollow! current_user
    render nothing: true, status: 200
  end
end
