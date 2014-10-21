module AvatarHelper

  # <img alt="@<%= username %>"
  #   class="avatar img-circle"
  #   width="24" height="24"
  #   src="<%= Avatar.url_from_email(email, 24) %>"
  #   srcset="<%= Avatar.url_from_email(email, 24*2) %>">

  def avatar_tag(user, size = 24, options={})
    if size.is_a?(Hash)
      options = size
      size = options.delete(:size)
    end

    url = if user.present?
      user.avatar.url(size * 2)
    else
      image_path('avatars/default.png')
    end

    alt = if user.present?
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
