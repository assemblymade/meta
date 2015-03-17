require 'spec_helper'

describe HeartablesController do
  let(:news_feed_item) { NewsFeedItem.make! }
  let(:user) { User.make! }
  let(:user2) { User.make! }

  before do
    sign_in user
  end

  it 'loves a heartable' do
    post :love,
      type: NewsFeedItem.to_s,
      id: news_feed_item.id

    expect(assigns(:heart).heartable).to eq(news_feed_item)
  end

  it 'returns errors when the item has had too much love' do
    news_feed_item.hearts.create!(user_id: user.id)

    post :love,
      type: NewsFeedItem.to_s,
      id: news_feed_item.id

    expect(JSON.parse(response.body)).to eq({
      "heartable_id" => ["has already been taken"]
    })
  end

  it 'updates hearts cache on user' do
    post :love, type: NewsFeedItem.to_s, id: news_feed_item.id

    expect(news_feed_item.user.hearts_received).to eq(1)
    expect(news_feed_item.user.last_hearted_at.to_i).to eq(assigns(:heart).created_at.to_i)
  end
end
