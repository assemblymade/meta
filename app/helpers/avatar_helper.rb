module AvatarHelper

  def avatar_tag(user, size)
    image_tag(user.avatar.url(size * 2),
      width:  size,
      height: size,
      class:  %w(avatar img-circle),
      alt:    "@#{user.username}"
    )
  end

end
