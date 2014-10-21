class NewsFeedItemCommentSerializer < ApplicationSerializer
  has_one :user, serializer: UserSerializer
  attributes :body, :created_at

  def user
    User.find(object.user_id)
  end
end
