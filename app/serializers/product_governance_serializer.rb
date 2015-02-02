class ProductGovernanceSerializer < ApplicationSerializer

  has_many :proposals
  attributes :slug, :name, :url

  def proposals
    object.proposals_sorted
  end

  def url
    product_governance_index_url(object.product)
  end


end
