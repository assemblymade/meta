class SingleSignOnController < ApplicationController
  after_action :set_access_control_headers

  def sso
    if return_sso_url.present?
      cookies.permanent[:user_source] = User::SIGNUP_SOURCE_CHANGELOG
    end
    if !signed_in?
      redirect_to new_user_registration_path
      return
    end

    return render text: "invalid sig", layout: false, status: 401 unless sign(params[:payload]) == params[:sig]
    return render text: "invalid nonce", layout: false, status: 401 unless nonce
    return render text: "invalid user", status: 403 unless requested_user.nil? || (current_user != requested_user)

    payload = return_payload

    packed = Base64.encode64(Rack::Utils.build_query(payload)).gsub("\n", '')

    return_url = return_sso_url || "#{ENV["LANDLINE_URL"]}/sessions/sso"
    redirect_to "#{return_url}?payload=#{URI.escape(packed)}&sig=#{sign(packed)}"
  end

  private

  def return_payload
    payload = req_payload.merge({
      id: current_user.id,
      avatar_url: current_user.avatar.url.to_s,
      username: current_user.username,
      email: current_user.email,
    })

    if return_sso_url.nil?
      # landline doesn't send return_sso_url and requires additional values
      payload[:team] = ENV["LANDLINE_TEAM"]
      payload[:real_name] = current_user.name,
      payload[:profile_url] = user_url(current_user)
    end
    payload
  end

  def req_payload
    @req_payload ||= Rack::Utils.parse_query(Base64.decode64(params[:payload]))
  end

  def nonce
    req_payload["nonce"]
  end

  def requested_user
    if uid = req_payload["uid"]
      User.find_by(authentication_token: uid)
    end
  end

  def return_sso_url
    req_payload["return_sso_url"]
  end

  def sign(payload)
    return false unless payload

    OpenSSL::HMAC.hexdigest(
      OpenSSL::Digest.new('sha256'),
      ENV["LANDLINE_SECRET"],
      payload
    )
  end

  def set_access_control_headers
    headers['Access-Control-Allow-Origin'] = '*'
    headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE'
    headers['Access-Control-Request-Method'] = '*'
    headers['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept'
  end
end
