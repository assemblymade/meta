class ProductGovernanceSerializer < ApplicationSerializer

  has_many :proposals
  attributes :slug, :name

end
