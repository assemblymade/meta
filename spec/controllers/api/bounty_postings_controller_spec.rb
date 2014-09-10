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
end