class MemberSerializer < ApplicationSerializer

  attributes :username, :url, :online

  def type
    "member"
  end

  def url
    user_path(object)
  end

  def online
    object.last_request_at > 1.hour.ago
  end

end
