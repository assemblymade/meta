class AvatarSerializer < ApplicationSerializer
  attributes :username, :avatar_url

  def avatar_url
    object.avatar.url(288).to_s
  end
end
