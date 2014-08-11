require 'spec_helper'

describe Users::PaymentOptionsController do
  let(:user) { User.make! }

  before { sign_in user }
  before { Stripe.api_key ||= 'fake' }

  describe '#create' do
    context 'bitcoin' do
      it 'saves settings' do
        post :create, payout_settings: {
          type: User::BitcoinPaymentOption,
          bitcoin_address: '16yuWBDNR2qs9tihGMZSv4HkwCKQHow6kf',
        }

        expect(assigns(:payment_option)).to be_valid
        expect(assigns(:payment_option)).to be_persisted
      end
    end

    context 'debit card' do
      it 'creates recipient and saves recipient_id' do
        # Stripe.api_key = 'nope'

        VCR.use_cassette('create_stripe_recipient') do
          token = Stripe::Token.create(
            card: {
              number: "4000056655665556",
              exp_month: 1,
              exp_year: Time.now.year + 1,
              cvc: 314
            },
          )

          post :create, payout_settings: {
            type: User::DebitPaymentOption,
          }, stripeToken: token.id
        end

        expect(assigns(:payment_option)).to be_valid
        expect(assigns(:payment_option)).to be_persisted
        expect(assigns(:payment_option).last4).to eq('5556')
      end

      it 'creates recipient and saves recipient_id' do
        # Stripe.api_key = 'nope'
        user.create_payment_option(type: User::DebitPaymentOption.to_s)

        VCR.use_cassette('update_stripe_recipient') do
          token = Stripe::Token.create(
            card: {
              number: "4000056655665556",
              exp_month: 1,
              exp_year: Time.now.year + 1,
              cvc: 314
            },
          )
          Actions::UpsertStripeRecipient.new(user, token.id).perform

          token = Stripe::Token.create(
            card: {
              number: "4000056655665556",
              exp_month: 1,
              exp_year: Time.now.year + 1,
              cvc: 314
            },
          )

          post :update, payout_settings: {
            type: User::DebitPaymentOption,
          }, stripeToken: token.id
        end

        expect(assigns(:payment_option)).to be_valid
        expect(assigns(:payment_option)).to be_persisted
        expect(assigns(:payment_option).last4).to eq('5556')
      end
    end
  end
end
