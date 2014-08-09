class User::Withdrawal < ActiveRecord::Base
  belongs_to :user

  validates :user, presence: true
  validates :total_amount, presence: true
  validates :amount_withheld, presence: true

  acts_as_sequenced column: :reference, start_at: 1

  def withholding
    if percentage = user.tax_info.try(:withholding)
      percentage * total_amount
    end
  end

  def payable_amount
    total_amount - withholding
  end
end
