module Actions
  class UpsertStripeRecipient
    def initialize(user, card_token)
      @user = user
      @card_token = card_token
    end

    def perform
      if recipient_id.nil?
        create_recipient!
      else
        update_recipient!
      end
    end

    def create_recipient!
      Stripe::Recipient.create(
        type: 'individual',
        name: @user.name,
        email: @user.email,
        card: @card_token,
        metadata: metadata
      ).tap do |recipient|
        @user.payment_option.update_attributes(
          recipient_id: recipient.id,
          last4: last4(recipient)
        )
      end
    end

    def update_recipient!
      recipient = Stripe::Recipient.retrieve(recipient_id)

      recipient.name = @user.name
      recipient.email = @user.email
      recipient.card = @card_token
      recipient.metadata = metadata

      recipient.save.tap do |recipient|
        @user.payment_option.update_attributes(
          last4: last4(recipient)
        )
      end
    end

    def recipient_id
      @user.payment_option.try(:recipient_id)
    end

    def metadata
      { user_id: @user.id }
    end

    def last4(recipient)
      recipient.cards.first.last4
    end
  end
end
