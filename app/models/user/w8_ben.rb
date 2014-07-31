class User::W8Ben < User::TaxInfo
  belongs_to :user

  validates :full_name, presence: true

end