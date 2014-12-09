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

  def type   #inelegant work-around for now, no user has ever changed payment types
    if self.user.payment_option.type == "User::BitcoinPaymentOption"
      return "bitcoin"
    else
      return "usd"
    end
  end

end
