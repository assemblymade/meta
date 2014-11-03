class User::W9 < User::TaxInfo
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

  validates :full_name, presence: true

  def slug
    'w9'
  end
end
