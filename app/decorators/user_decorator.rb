class UserDecorator < ApplicationDecorator

  decorates_finders

  def avatar_url(size=220)
    helpers.image_path(avatar.url(size * 2))
  end

  def sum_app_cents
    TransactionLogEntry.sum_balances(self)
  end

  def count_contributions
    Event.where(user_id: self.id).count + Work.where(user_id: self.id).count
  end

  def twitter_connected?
    twitter_uid.present?
  end

  def twitter_url
    "https://twitter.com/#{twitter_nickname}"
  end

  def facebook_connected?
    facebook_uid.present?
  end

  def facebook_url
    "https://facebook.com/#{facebook_uid}"
  end

  def facebook_username
    JSON.parse(extra_data)['username'] if extra_data.present?
  end

  def github_connected?
    github_login.present?
  end

  def github_url
    "https://github.com/#{github_login}"
  end

end
