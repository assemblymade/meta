class TipSerializer < BaseSerializer

  has_one :from
  has_one :to

  attributes :cents

end
