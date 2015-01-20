require 'spec_helper'

describe NewsFeedItemCommentsController do
  let(:user) { User.make! }
  let(:task) { Task.make! }
  let(:nfi_post) { NewsFeedItemPost.make! }
  let(:task_nfi) { NewsFeedItem.make!(target: task) }
  let(:post_nfi) { nfi_post.news_feed_item }
  let(:product) { task.product }

  describe '#create' do
    it "creates a NewsFeedItemComment" do
      sign_in user

      post :create, product_id: product.slug, update_id: task_nfi.id, body: "grumble grumble"

      expect(assigns(:comment).body).to eq("grumble grumble")
    end
  end

  describe '#index' do
    let!(:comment) { NewsFeedItemComment.make!(news_feed_item: task_nfi) }

    it "returns NewsFeedItemComments and Events" do
      get :index, product_id: product.slug, update_id: task_nfi.id, format: :json

      expect(JSON.parse(response.body)["comments"].first["body"]).to eq(comment.body)
    end
  end

  describe '#update' do
    let!(:comment) { NewsFeedItemComment.make!(news_feed_item: task_nfi) }

    it "updates a comment" do
      get :index, product_id: product.slug, update_id: task_nfi.id, format: :json

      expect(JSON.parse(response.body)["comments"].first["body"]).to eq(comment.body)

      patch :update, product_id: product.slug, update_id: task_nfi.id, id: comment.id, comment: { body: "rabble rabble" }
      get :index, product_id: product.slug, update_id: task_nfi.id, format: :json

      expect(JSON.parse(response.body)["comments"].first["body"]).to eq("rabble rabble")
    end
  end
end
