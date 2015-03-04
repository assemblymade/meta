class AvatarSerializer < ApplicationSerializer
  attributes :username, :avatar_url
  attributes :url

  def avatar_url
    object.avatar.url(288).to_s
  end

  def url
    user_path(object)
  end
  
end
