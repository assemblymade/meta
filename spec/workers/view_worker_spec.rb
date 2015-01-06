require 'spec_helper'

describe ViewWorker do
  let(:user) { User.make! }
  let(:product) { Product.make! }
  let(:normark) { Mark.create!({name: "NORMARK"}) }
  let(:wip) { Wip.make! }

  describe '#perform' do
     it 'adjusts markings from view event' do
       Marking.create!({mark: normark, markable: product, weight: 2.0})
       ViewWorker.new.perform(user.id, product.id, "Product")
       ViewWorker.new.perform(user.id, wip.id, "Wip")
     end
  end
end
