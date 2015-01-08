require 'spec_helper'

describe AdjustMarkings do
  let(:user) { User.make! }
  let(:product) { Product.make! }

  describe '#perform' do
    it 'adjusts markings for test user' do
      mark = Mark.create!({name: 'DENMARK'})
      Marking.create!({mark: mark, markable: product, weight: 2.0})

      expect {
        AdjustMarkings.new.perform(user.id, "User", product.id, "Product", 1.0)
      }.to change(Marking, :count).by(1)
    end
  end
end
