# Test number: 5200828282828210
class User::DebitPaymentOption < User::PaymentOption
  def save_account
    Actions::UpsertStripeRecipient.new(user, card_token).perform
    true
  rescue Stripe::InvalidRequestError => e
    Rails.logger.info "Stripe request failed: #{e}"
    errors.add(:recipient_id, "error: #{e.message}")
    false
  end

  def description
    if bitcoin_address =~ /@/
      "Paypal #{bitcoin_address}"
    else
      "Stripe #{recipient_id}"
    end
  end
end
