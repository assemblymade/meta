class User::TaxInfo < ActiveRecord::Base
  belongs_to :user

  CLASSIFICATIONS = [
    'Individual/sole proprietor',
    'C Corporation',
    'S Corporation',
    'Partnership',
    'Trust/estate',
    'LLC (Single member)',
    'LLC (C Corporation)',
    'LLC (S Corporation)',
    'LLC (Partnership)',
    'Exempt payee'
  ]

  attr_accessor :signature

  validates :full_name, presence: true
  validate :signature_match

  # private

  def signature_match
    if signature != full_name
      errors.add(:signature, "must match full name")
    end
  end

end