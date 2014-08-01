class User::PaymentOption < ActiveRecord::Base
  belongs_to :user

  validates :type, inclusion: { in: %w(User::BitcoinPaymentOption) }
end