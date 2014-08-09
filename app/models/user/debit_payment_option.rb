class User::DebitPaymentOption < User::PaymentOption
  def product_project
    Actions::UpsertStripeRecipient.new(user, card_token).perform
    true
  rescue Stripe::InvalidRequestError => e
    errors.add(:card_token, e.message)
    false
  end
end
