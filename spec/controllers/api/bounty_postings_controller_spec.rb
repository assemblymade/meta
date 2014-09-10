require 'spec_helper'

describe Api::BountyPostingsController do
  let(:product) { Product.make! }
  let(:user) { product.user }
  let(:bounty) { Task.make!(product: product) }

  describe '#create' do
    it 'creates posting' do
      sign_in user
      post :create, product_id: product.slug, bounty: bounty.number, tag: 'marketing'

      expect(
        assigns(:posting).bounty_id
      ).to eq(bounty.id)
    end
  end

  describe '#delete' do
    let(:posting) { BountyPosting.make!(bounty: bounty) }
    it 'expires posting' do
      sign_in user
      delete :destroy, product_id: product.slug, id: posting.id

      expect(
        assigns(:posting).expired_at
      ).to_not be_nil
    end
  end
end