require 'spec_helper'

describe ProductTrend do
  let(:product) { Product.make! }
  let(:chat_room) { ChatRoom.make!(product: product, wip: Wip.make!) }

  describe '#trend_score' do

    it 'sends the trend score' do
      Activity.make!(product: product, created_at: 1.day.ago)
      Activity.make!(product: product, created_at: 2.day.ago)
      Activity.make!(product: product, created_at: 3.day.ago)

      trend = ProductTrend.create!(product_id: product.id)
      trend.set_score!
      
      expect(trend.score).to eq(3.0)
    end
  end
end
