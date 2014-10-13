class BountySerializer < ApplicationSerializer
  include MarkdownHelper

  attributes :contracts, :flagged, :following, :markdown_description, :number,
    :offers, :open, :state, :title, :value

  attributes :close_url, :edit_url, :flag_url, :follow_url, :offers_url,
    :mute_url, :tag_url, :unflag_url, :urgency_url, :reopen_url, :url

  has_one :product

  has_one :urgency

  has_one :user

  has_many :offers

  has_many :tags

  def flagged
    bounty.flagged?
  end

  def following
    bounty.followed_by?(scope)
  end

  def markdown_description
    product_markdown(product, bounty.description)
  end

  def open
    bounty.open?
  end

  def offers
    bounty.active_offers
  end

  def close_url
    product_wip_close_path(product, bounty)
  end

  def edit_url
    edit_product_wip_path(product, bounty)
  end

  def unflag_url
    product_wip_unflag_path(product, bounty)
  end

  def flag_url
    product_wip_flag_path(product, bounty)
  end

  def follow_url
    product_wip_watch_path(product, bounty)
  end

  def offers_url
    api_product_bounty_offers_path(product, bounty)
  end

  def mute_url
    product_wip_mute_path(product, bounty)
  end

  def tag_url
    product_wip_tag_path(product, bounty)
  end

  def reopen_url
    product_wip_reopen_path(product, bounty)
  end

  def urgency_url
    product_task_urgency_path(product, bounty)
  end

  def url
    product_wip_path(product, bounty)
  end

  def product
    bounty.product
  end

  def bounty
    object
  end
end
