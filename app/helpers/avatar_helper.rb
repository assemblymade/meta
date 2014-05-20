module AvatarHelper

  def avatar_tag(user, size, options={})
    url = if user.nil?
      image_path('avatars/default.png')
    else
      user.avatar.url(size * 2)
    end

    attributes = {
      width:  size,
      height: size,
      class:  %w(avatar img-circle),
      alt:    "@#{user.username}"
    }.merge(options)

    image_tag(url, attributes)
  end

end
