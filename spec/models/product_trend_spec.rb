require 'spec_helper'

describe ProductTrend do
  let(:product) { Product.make! }
  let(:chat_room) { ChatRoom.make!(product: product, wip: Wip.make!) }

  describe '#trend_score' do

    it 'sends the trend score' do
      stream = ActivityStream.new(chat_room.id)
      three = stream.push( Activity.make!(created_at: 1.day.ago) )
      two = stream.push( Activity.make!(created_at: 2.day.ago) )
      one = stream.push( Activity.make!(created_at: 3.day.ago) )

      trend = ProductTrend.create!(product_id: product.id)
      trend.set_score!
      expect(trend.score).to eq(3.0)
    end
  end
end
