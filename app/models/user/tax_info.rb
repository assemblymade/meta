class User::TaxInfo < ActiveRecord::Base
  belongs_to :user

  validates :type, inclusion: { in: %w(User::W9 User::W8Ben) }

  attr_accessor :signature
  validate :signature_match

  # private

  def signature_match
    if signature != full_name
      errors.add(:signature, "must match full name")
    end
  end

end