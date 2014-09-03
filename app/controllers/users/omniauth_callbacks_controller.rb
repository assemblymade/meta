class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  include Devise::Controllers::Rememberable

  def facebook
    @user = User.find_by(facebook_uid: auth_hash['uid'])
    if @user
      remember_me(@user)
      sign_in(@user)
      @user.extra_data = auth_hash['extra']['raw_info'].to_json
      @user.save!

      redirect_to after_sign_in_path_for_user
    else
      @user = User.new(
        email: auth_hash['info']['email'],
        extra_data: auth_hash['extra']['raw_info'],
        location: auth_hash['info']['location'],
        username: auth_hash['info']['nickname'],
        name: auth_hash['info']['name'],
        facebook_uid: auth_hash['uid']
      )

      render 'users/registrations/new'
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
