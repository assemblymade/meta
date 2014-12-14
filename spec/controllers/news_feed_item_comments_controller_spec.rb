require 'spec_helper'

describe NewsFeedItemCommentsController do
  let(:user) { User.make! }
  let(:task) { Task.make! }
  let(:nfi_post) { NewsFeedItemPost.make! }
  let(:task_nfi) { NewsFeedItem.make!(target: task) }
  let(:post_nfi) { nfi_post.news_feed_items.first }
  let(:product) { task.product }

  it 'creates an event when the target is a wip' do
    sign_in user

    expect {
      post :create, product_id: product.slug, update_id: task_nfi.id, body: 'To the library!'
    }.to change(Event, :count).by(1)
  end

  it "doesn't create an event for non wips" do
    sign_in user

    expect {
      post :create, product_id: product.slug, update_id: post_nfi.id, body: 'Fancy!'
    }.to_not change(Event, :count)
  end
end
