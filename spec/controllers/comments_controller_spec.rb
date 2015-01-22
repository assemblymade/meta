require 'spec_helper'

describe CommentsController do
  let(:user) { User.make! }
  let(:discussion) { NewsFeedItem.make! }

  describe 'index' do
    before do
      discussion.comments.create(user: user, body: 'oh hay')
    end

    it 'returns comments' do
      get :index, discussion_id: discussion.id, format: :json

      body = JSON.parse(response.body)
      expect(body["comments"].count).to eq(1)
    end
  end

  describe 'create' do
    before do
      sign_in user
    end

    it 'persists' do
      post :create, discussion_id: discussion.id, body: 'i like to move it move it', format: :json

      expect(assigns(:comment).body).to eq('i like to move it move it')
    end
  end

  describe 'update' do
    let!(:comment) { discussion.comments.create!(user: user, body: 'oh hay') }

    before do
      sign_in user
    end

    it "updates a comment" do
      patch :update, discussion_id: discussion.id, id: comment.id, comment: { body: "rabble rabble" }, format: :json

      body = JSON.parse(response.body)
      expect(body["markdown_body"]).to eq("<p>rabble rabble</p>")
    end
  end

end
