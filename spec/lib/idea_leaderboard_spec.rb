require 'spec_helper'

describe IdeaLeaderboard do
  let(:product) { Product.make! }
  let(:redis) { Redis.new(host: '127.0.0.1', db: 15) }
  let(:lb) { IdeaLeaderboard.new(Leaderboard.new(redis))}

  after(:each) do
    redis.flushdb
    redis.client.disconnect
  end

  describe '#add' do
    it 'invalidates cache' do
      product.touch
      Timecop.travel(2.hours)
      expect {
        lb.add(product)
      }.to change { product.updated_at.to_s }.from(2.hours.ago.to_s).to(Time.current.to_s)
    end
  end
end
