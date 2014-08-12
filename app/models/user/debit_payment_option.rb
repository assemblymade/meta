# Test number: 5555555555554444
class User::DebitPaymentOption < User::PaymentOption
  def save_account
    Actions::UpsertStripeRecipient.new(user, card_token).perform
    true
  rescue Stripe::InvalidRequestError => e
    errors.add(:card_token, e.message)
    false
  end
end
