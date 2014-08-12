require 'spec_helper'

describe OffersController do
  let(:bounty) { Task.make! }
  let(:product) { bounty.product }
  describe '#create' do
    it 'creates contract' do
      post :create, product_id: product.id, bounty_id: bounty.id,
        amount: 5000

      expect(response).to be_successful
      expect(assigns(:contract)).to be_persisted
    end
  end
end
