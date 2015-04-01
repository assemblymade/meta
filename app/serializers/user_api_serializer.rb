class UserApiSerializer < ApplicationSerializer
  attributes :avatar_url, :bio, :last_online, :staff, :url, :username

  def avatar_url
    object.avatar.url(288).to_s
  end

  def last_online
    object.last_request_at.iso8601 if object.last_request_at?
  end

  def staff
    object.staff?
  end

  def url
    user_url(object)
  end
end
