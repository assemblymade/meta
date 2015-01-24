module AvatarHelper
  
  def avatar_tag(user, size = 24)
    react_component('Avatar',
      user: AvatarSerializer.new(user),
      size: size
    )
  end

  def user_link(user, options={}, &blk)
    attributes = {
      href: user_path(user),
      title: "@#{user.username}"
    }.merge(options)
    content_tag :a, capture(&blk), attributes
  end

  def user_link_username(user, options={}, &blk)
    user_link(user, options) do
      "@#{user.username}"
    end
  end

end
