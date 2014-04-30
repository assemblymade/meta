class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def facebook
    @user = User.find_by(facebook_uid: auth_hash['uid'])

    if @user
      sign_in(@user)
      @user.extra_data = auth_hash['extra']['raw_info'].to_json
      @user.save!

      render json: @user
    else
      render json: {
        avatar_url: auth_hash,
        email: auth_hash['info']['email'],
        extra: auth_hash['extra']['raw_info'],
        image: auth_hash['info']['image'],
        location: auth_hash['info']['location'],
        name: auth_hash['info']['name'],
        uid: auth_hash['uid'],
      }
    end
  end

  def github
    if signed_in?
      current_user.update_attributes github_uid: auth_hash['uid'], github_login: auth_hash['extra']['raw_info']['login']
      redirect_to user_path(current_user)
    end
  end

  def twitter
    if signed_in?
      current_user.update_attributes twitter_uid: auth_hash['uid'], twitter_nickname: auth_hash['info']['nickname']
      redirect_to user_path(current_user)
    end
  end

  def sign_in_with_facebook(user)
    if @user.id != params[:user][:id]
      render :status => :unauthorized, json: {
        error: 'wrong_user',
        facebook_user: auth_hash['info']['name']
      }
    else
      sign_in(@user)
      render :nothing => :true
    end
  end

  private

  def auth_hash
    request.env['omniauth.auth']
  end
end