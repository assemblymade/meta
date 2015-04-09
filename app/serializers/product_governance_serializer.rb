class ProductGovernanceSerializer < ApplicationSerializer

  has_many :proposals
  attributes :slug, :name, :url

  def proposals
    Proposal.proposals_on_product(object)
  end

  def url
    product_governance_index_url(object.product)
  end

end
