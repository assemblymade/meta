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
    "https://www.youtube.com/embed/#{you_tube_video_id}?autoplay=0"
  end

  def video?
    you_tube_video_url.present?
  end

  def partner?(user)
    user && TransactionLogEntry.where(product_id: id).where(wallet_id: user.id).any?
  end

  def reward
    for_profit? ? 'Bounties' : 'Karma'
  end

  def currency
    for_profit? ? 'Coins' : 'Karma'
  end

  def stakeholders
    for_profit? ? 'Ownership' : 'Contributors'
  end

  def sum_active_auto_tips
    AutoTipContract.active_at(self, Time.now).sum(:amount)
  end

end
