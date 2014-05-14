module AvatarHelper

  def avatar_tag(user, size, attributes={})
    image_tag(
      user.avatar.url(size * 2),
      {
        width:  size,
        height: size,
        class:  %w(avatar img-circle),
        alt:    "@#{user.username}"
      }.merge(attributes)
    )
  end

end
