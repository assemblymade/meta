module AvatarHelper

  def avatar_tag(user, size, options={})
    url = if user.nil?
      image_path('avatars/default.png')
    else
      user.avatar.url(size * 2)
    end

    alt = if user.nil?
      ""
    else
      "@#{user.username}"
    end

    attributes = {
      width:  size,
      height: size,
      class:  %w(avatar img-circle),
      alt:    alt
    }.merge(options)

    image_tag(url, attributes)
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
