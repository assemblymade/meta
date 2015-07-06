require 'digest/md5'
require 'active_support/core_ext'
require 'uri'

class Avatar < Struct.new(:user)

  def url(size=nil)
    return helpers.image_path(user.avatar_url.to_s) if user.avatar_url

    Avatar.url_from_email(user.email.downcase, size)
  end

  def self.url_from_email(email, size=nil)
    digest = Digest::MD5.hexdigest(email)
    query = {
      d: 'https://cove.assembly.com/assets/default_avatar.png'
    }

    query[:s] = size if size

    URI::HTTPS.build(
      host: 'gravatar.com',
      path: File.join('/avatar', digest),
      query: query.to_param
    )
  end

# private

  def helpers
    ActionController::Base.helpers
  end

end
