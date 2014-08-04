class User::DebitPaymentOption < User::PaymentOption
  def save_account!
    Actions::UpsertStripeRecipient.new(user, card_token).perform
  end
end
