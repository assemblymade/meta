class ProductGovernanceSerializer < ApplicationSerializer

  has_many :proposals
  attributes :slug, :name, :proposalsorted

  def proposalsorted
    object.proposals_sorted
  end


end
