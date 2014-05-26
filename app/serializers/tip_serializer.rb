class TipSerializer < ApplicationSerializer

  has_one :from
  has_one :to

  attributes :cents

end
