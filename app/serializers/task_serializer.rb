class TaskSerializer < ApplicationSerializer
  include ReadraptorTrackable
  include MarkdownHelper
  include Nokogiri
  include TruncateHtmlHelper

  attributes :number, :title, :url, :value, :markdown_description,
    :state, :short_description, :comments_count, :thumbnails, :push_channel,
    :steps, :offers_url, :contracts

  has_one :urgency

  has_many :tags
  has_many :invites
  has_many :offers
  has_many :tags
  has_many :wip_workers
  has_many :workers

  def url
    product_wip_path(product, number || id)
  end

  def contracts
    WipContracts.new(object, product.auto_tip_contracts.active)
  end

  def invites
    Invite.where(invitor: current_user, via: bounty)
  end

  def markdown_description
    product_markdown(product, object.description)
  end

  def product
    @product ||= object.product
  end

  def offers_url
    api_product_bounty_offers_path(product, bounty)
  end

  def short_description
    truncate_html(product_markdown(product, object.description), length: 200)
  end

  def steps
    BountyGuidance::Valuations.suggestions(product)
  end

  def thumbnails
    Nokogiri::HTML(markdown_description).css('img').map do |img|
      img['src']
    end
  end

  def value
    contracts.earnable_cents.floor
  end

  def current_user
    scope
  end

  def bounty
    object
  end

  cached

  def cache_key
    object
  end
end
