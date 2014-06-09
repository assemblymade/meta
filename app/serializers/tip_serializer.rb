class TipSerializer < ApplicationSerializer

  has_one :from
  has_one :to

  attributes :cents

  attributes :from_username, :from_avatar_url

  def from_username
    object.from.username
  end

  def from_avatar_url
    object.from.avatar.url(120)
  end

end
