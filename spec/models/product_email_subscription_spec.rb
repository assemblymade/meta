require 'spec_helper'

describe ProductEmailSubscription do
  let(:product) { Product.make! }
  let(:user) { User.make! }

  describe '#create' do
    it 'creates a product_subscription' do
      ProductEmailSubscription.create!(product_id: product.id, email: user.email)

      expect(ProductEmailSubscription.find_by(product_id: product.id, email: user.email)).not_to be_nil
    end
  end

  describe '#destroy' do
    it 'destroys a product_subscription' do
      expect(ProductEmailSubscription.create!(product_id: product.id, email: user.email)).to be_valid

      subscription = ProductEmailSubscription.find_by(product_id: product.id, email: user.email)

      expect(subscription).not_to be_nil

      subscription.destroy!

      expect(ProductEmailSubscription.find_by(product_id: product.id, email: user.email)).to be_nil
    end
  end
end
