require 'spec_helper'

describe NewsFeedItemsController do
  let(:user) { User.make! }
  let(:task) { Task.make! }
  let(:product) { task.product }
  let(:nfi) { NewsFeedItem.make!(product: product) }

  describe '#update' do
    it 'allows a core team member to update the item' do
      product.core_team << user
      sign_in user

      patch :update, product_id: product.slug, id: nfi.id, news_feed_item: { archived_at: Time.now }
      expect(response).to be_successful
    end

    it 'does not allow non-core team members to update the item' do
      sign_in user

      patch :update, product_id: product.slug, id: nfi.id, news_feed_item: { archived_at: Time.now }
      expect(response).not_to be_successful
    end
  end
end
