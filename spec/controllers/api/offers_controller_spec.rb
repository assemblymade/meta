require 'spec_helper'

describe Api::OffersController do
  let(:bounty) { Task.make! }
  let(:product) { bounty.product }
  let(:user) { bounty.user }

  describe '#create' do
    it 'creates contract' do
      sign_in user

      TransactionLogEntry.minted!(nil, Time.now, product, bounty.id, user.id, 1)

      post :create, product_id: product.slug, bounty_id: bounty.number,
        amount: 5000.78, format: :json

      expect(response).to be_successful
      expect(assigns(:offer)).to be_persisted
    end
  end
end
