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

  it 'can be unloved' do
    heart = news_feed_item.hearts.create!(user_id: user.id)

    post :unlove,
      type: NewsFeedItem.to_s,
      id: news_feed_item.id

    expect(response.status).to eq(200)
  end

  it 'returns hearts without current user' do
    news_feed_item.hearts.create!(user_id: user.id)
    heart = news_feed_item.hearts.create!(user_id: user2.id)

    get :hearts,
      heartable_ids: [news_feed_item.id]

    expect(JSON.parse(response.body)).to eq(
      [JSON.parse(HeartSerializer.new(heart).to_json)]
    )
  end
end
