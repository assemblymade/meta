require 'spec_helper'

describe Users::PaymentOptionsController do
  let(:user) { User.make! }

  describe '#create' do
    it 'can add bitcoin option' do
      sign_in user

      post :create, payment_option: {
        type: User::BitcoinPaymentOption,
        bitcoin_address: '16yuWBDNR2qs9tihGMZSv4HkwCKQHow6kf',
      }

      expect(assigns(:payment_option)).to be_valid
      expect(assigns(:payment_option)).to be_persisted
    end
  end
end
