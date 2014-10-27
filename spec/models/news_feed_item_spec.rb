require 'spec_helper'

describe NewsFeedItem do
  describe 'self.create_with_target' do
    let(:product) { Product.make! }
    let(:user) { User.make! }
    let(:kernel) { User.make!(username: 'kernel') }
    let(:task) { Task.make!(product: product, user: user) }
    let(:kernel_task) { Task.make!(product: product, user: kernel) }

    it 'creates a NewsFeedItem when passed a target' do
      expect(NewsFeedItem.create_with_target(task)).to be_a NewsFeedItem
    end

    it 'does not create a NewsFeedItem from @kernel' do
      expect(NewsFeedItem.create_with_target(kernel_task)).to be_nil
    end
  end
end
