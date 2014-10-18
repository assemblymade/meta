require 'spec_helper'

describe NewsFeedItem do
  describe 'self.create_with_target' do
    let(:product) { Product.make! }
    let(:user) { User.make! }
    let(:task) { Task.make!(product: product, user: user) }

    it 'creates a NewsFeedItem when passed a target' do
      expect(NewsFeedItem.create_with_target(task)).to be_a NewsFeedItem
    end
  end
end
