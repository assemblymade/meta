require 'spec_helper'

describe AdjustMarkings do
  let(:user) { User.make! }
  let(:product) { Product.make! }

  describe '#perform' do
    it 'adjusts markings for test user' do
      Mark.create!({name: 'DENMARK'})
      Marking.create!({mark: mark, markable: product})

      expect {
        AdjustMarkings.new.perform(user.id, product.id, "Product", 0.0)
      }.to change(Marking, :count).by(1)
    end
  end
end
