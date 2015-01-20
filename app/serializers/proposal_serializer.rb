class ProposalSerializer < ApplicationSerializer
  attributes :name, :description, :status

  has_one :user

  def url
    product_proposal_path(product, object)
  end
end
