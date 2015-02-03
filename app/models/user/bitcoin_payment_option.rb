class User::BitcoinPaymentOption < User::PaymentOption
  def description
    "Bitcoin #{bitcoin_address}"
  end
end
