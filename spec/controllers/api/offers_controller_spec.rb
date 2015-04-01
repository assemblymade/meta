require 'spec_helper'
require 'pry'

describe Api::OffersController do
  let(:bounty) { Task.make! }
  let(:product) { bounty.product }
  let(:user) { bounty.user }

  describe '#create' do
    it 'creates contract' do
      sign_in user

      TransactionLogEntry.minted!(nil, Time.now, product, user.id, 1)

      post :create, product_id: product.slug, bounty_id: bounty.number, earnable: 5000, format: :json

      bounty.reload

      expect(response).to be_successful
      expect(bounty[:value]).to eq(5000)
    end
  end
end
