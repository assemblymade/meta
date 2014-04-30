require 'digest/md5'
require 'active_support/core_ext'
require 'uri'

class Avatar < Struct.new(:user)

  def url(size)
    return helpers.image_path(user.avatar_url.to_s) if user.avatar_url

    digest = Digest::MD5.hexdigest(user.email.downcase)
    query = {
      s: size,
      d: 'https://assemblymade.com/assets/avatars/default.png'
    }.to_param

    URI::HTTPS.build(
      host: 'gravatar.com',
      path: File.join('/avatar', digest),
      query: query
    )
  end

# private

  def helpers
    ActionController::Base.helpers
  end

end
