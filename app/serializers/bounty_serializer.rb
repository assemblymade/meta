class BountySerializer < ApplicationSerializer
  include MarkdownHelper

  attributes :contracts, :markdown_description, :number, :offers, :offers_url, :open, :state,
    :tag_url, :title, :urgency_url, :value

  has_one :product

  has_one :urgency

  has_one :user

  has_many :offers

  has_many :tags

  def markdown_description
    product_markdown(product, bounty.description)
  end

  def open
    bounty.open?
  end

  def offers
    bounty.active_offers
  end

  def offers_url
    api_product_bounty_offers_path(product, bounty)
  end

  def tag_url
    product_wip_tag_path(product, bounty)
  end

  def urgency_url
    product_task_urgency_path(product, bounty)
  end

  def product
    bounty.product
  end

  def bounty
    object
  end
end
