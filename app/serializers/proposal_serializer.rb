class ProposalSerializer < ApplicationSerializer
  attributes :name, :description, :status

  has_one :news_feed_item, foreign_key: 'target_id'

  has_one :user

  def url
    product_proposal_path(product, object)
  end
end
