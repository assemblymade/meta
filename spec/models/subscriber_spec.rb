require 'spec_helper'

describe Subscriber do
  let(:product) { Product.make! }
  let(:user) { User.make! }

  describe '#create' do
    it 'creates a product_subscription' do
      Subscriber.create!(product_id: product.id, email: user.email)

      expect(Subscriber.find_by(product_id: product.id, email: user.email)).not_to be_nil
    end
  end

  describe '#destroy' do
    it 'destroys a product_subscription' do
      expect(Subscriber.create!(product_id: product.id, email: user.email)).to be_valid

      subscription = Subscriber.find_by(product_id: product.id, email: user.email)

      expect(subscription).not_to be_nil

      subscription.destroy!

      expect(Subscriber.find_by(product_id: product.id, email: user.email)).to be_nil
    end
  end
end
