class User::Withdrawal < ActiveRecord::Base
  belongs_to :user

  validates :user, presence: true
  validates :total_amount, presence: true
  validates :amount_withheld, presence: true

  scope :paid, -> { where.not(payment_sent_at: nil) }

  acts_as_sequenced column: :reference, start_at: 1

  def payable_amount
    total_amount - amount_withheld
  end

  # def type   #inelegant work-around for now, no user has ever changed payment types
  #   if self.user.payment_option.type == "User::BitcoinPaymentOption"
  #     return "bitcoin"
  #   else
  #     return "usd"
  #   end
  # end

end
