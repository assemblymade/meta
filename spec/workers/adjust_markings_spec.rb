require 'spec_helper'

describe AdjustMarkings do
  let(:user) { User.make! }
  let(:product) { Product.make! }

  describe '#perform' do
    it 'adjusts markings for test user' do
      subject.perform(user.id, product.id, "Product", 0.0)
    end
  end
end
