class ProductDecorator < ApplicationDecorator
  include MarkdownHelper

  NUMBER_OF_CONTRIBUTORS_CONSIDERED_IMPORANT = 2 * 6

  decorates_finders
  decorates_association :contributors
  decorates_association :core_team
  decorates_association :status_updates

  def hero_image_path
    helpers.image_path(poster_image.url)
  end

  def hero_image_url
    helpers.image_url(poster_image.url)
  end

  def lead_and_description
    "#{lead}\n\n#{description}"
  end

  def lead_html
    markdown(lead)
  end

  def description_html
    product_markdown(object, description)
  end

  def important_contributors
    object.
      contributors(NUMBER_OF_CONTRIBUTORS_CONSIDERED_IMPORANT).
      map(&:decorate)
  end

  def uninmportant_contributors_count
    count_contributors - NUMBER_OF_CONTRIBUTORS_CONSIDERED_IMPORANT
  end

  def signup_button_copy(user)
    if user && user.voted_for?(self)
      "Thanks for signing up"
    else
      "Sign up pre-launch"
    end
  end

  def presentable_stage
    case stage
    when :validating
      'Idea'
    when :building
      'Greenlit'
    end
  end

  def social_media_title
    "#{name} - #{pitch}"
  end

  def you_tube_video_id
    if you_tube_video_url[/youtu\.be\/([^\?]*)/]
      $1
    else
      # From
      # http://stackoverflow.com/questions/3452546/javascript-regex-how-to-get-youtube-video-id-from-url/4811367#4811367
      you_tube_video_url[/^.*((v\/)|(embed\/)|(watch\?))\??v?=?([^\&\?]*).*/]
      $5
    end
  end

  def you_tube_video_embed_url
    "https://www.youtube.com/embed/#{you_tube_video_id}"
  end

  def current_exchange_rate
    Rails.cache.fetch([self.id, 'exchange_rate'], expires_in: 12.hours) do
      TransactionLogExchangeRate.at(self.id, Time.now)
    end
  end

  def reward
    for_profit? ? 'Tasks' : 'Karma'
  end

  def currency
    for_profit? ? 'Coins' : 'Karma'
  end

  def stakeholders
    for_profit? ? 'Ownership' : 'Contributors'
  end

  def sum_bounties
    Rails.cache.fetch([self.cache_key, 'sum_bounties']) do
      open_score = wips.open.map(&:score).compact.reduce(0, :+)
      current_exchange_rate * open_score
    end
  end

  def real_bounty_value
    sum_bounties * 100
  end

  def sum_active_auto_tips
    AutoTipContract.active_at(self, Time.now).sum(:amount)
  end

end
