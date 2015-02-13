require 'spec_helper'

describe FilterUpdatesQuery do
  let(:user) { User.make! }
  let(:product) { Product.make! }
  let(:bounty) { Task.make!(product: product, user: user) }
  let(:membership) { TeamMembership.make!(product: product, user: user) }
  let(:post) { Post.make!(product: product, author: user) }

  describe 'self.call' do
    before do
      NewsFeedItem.create_with_target(bounty)
      NewsFeedItem.create_with_target(membership)
      post.news_feed_item.update(product: product)
    end

    it 'initializes and filters a FilterUpdatesQuery' do
      expect(FilterUpdatesQuery.call(product.news_feed_items).count).to eq(3)
    end
  end

  describe '#archived' do
    before do
      NewsFeedItem.create_with_target(bounty)
      NewsFeedItem.create_with_target(membership)
      post.news_feed_item.update(product: product, archived_at: Time.now)
    end

    it 'returns archived updates if asked' do
      expect(FilterUpdatesQuery.call(product.news_feed_items, { archived: true }).
      first.archived_at).to be_within(20).of(Time.now)
    end

    it 'returns unarchived updates by default' do
      expect(
        FilterUpdatesQuery.call(product.news_feed_items).map(&:archived_at)
      ).to eq([nil, nil])
    end
  end

  describe '#with_mark' do
    before do
      NewsFeedItem.create_with_target(bounty)
      NewsFeedItem.create_with_target(membership)
      post.news_feed_item.update(product: product)
      post.update(mark_names: ['marky mark'])
    end

    it 'returns NFIs whose targets have the given mark' do
      expect(
        FilterUpdatesQuery.call(
          product.news_feed_items, { mark: 'marky mark' }
        ).first.target.mark_names
      ).to eq(['marky mark'])
    end
  end

  describe '#with_type' do
    before do
      NewsFeedItem.create_with_target(bounty)
      NewsFeedItem.create_with_target(membership)
    end

    it 'returns only NFIs of the given type' do
      expect(
        FilterUpdatesQuery.call(
          product.news_feed_items, { type: 'team_membership' }
        ).first.target_type
      ).to eq('TeamMembership')
    end
  end
end
