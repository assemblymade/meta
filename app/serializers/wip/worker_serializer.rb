class Wip::WorkerSerializer < ActiveModel::Serializer
  attributes :created_at, :user_url

  has_one  :user, serializer: UserSerializer

  def created_at
    object.created_at.iso8601
  end

  def worker_url
    user_path(object.user)
  end
end
