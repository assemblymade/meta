class ProductGovernanceSerializer < ApplicationSerializer

  has_many :proposals
  attributes :slug, :name
  
  def proposals
    object.proposals_sorted
  end


end
