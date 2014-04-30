class AuthorSerializer < ActiveModel::Serializer
  attributes :id, :path, :name, :avatar_url

  def path
    user_path(object)
  end

  def avatar_url
    object.avatar.url(60).to_s
  end

end
