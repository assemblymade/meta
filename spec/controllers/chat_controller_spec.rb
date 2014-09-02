require 'spec_helper'

describe ChatController do
  let!(:user) { User.make! }
  let!(:product) { Product.make!(main_thread: Discussion.make!) }

  describe '#create' do
    before do
      sign_in user
    end

    it 'does not cause a user to follow a product' do
      post :create, product_id: product.slug, body: 'oh hai!'

      expect(product.followed_by?(user)).to be_false
    end
  end
end
