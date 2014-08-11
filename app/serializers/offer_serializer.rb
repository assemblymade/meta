class OfferSerializer < ApplicationSerializer
  has_one :user

  attributes :amount, :influence
end
