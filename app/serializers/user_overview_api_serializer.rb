class UserOverviewApiSerializer < ActiveModel::Serializer
  attributes :avatar_url, :bio, :username, :staff, :twitter, :core

  def avatar_url
    object.avatar.url(288).to_s
  end

  def bio
    object.bio
  end

  def staff
    object.is_staff
  end

  def username
    object.username
  end

  def twitter
    object.twitter_nickname
  end
end
