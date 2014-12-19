require 'spec_helper'

describe Webhooks::MailgunController do
  describe '#reply' do

    let(:user) { User.make!(email: 'joey@example.com') }
    let(:nfi) { Post.make!.news_feed_item }

    before do
      controller.stub(:verify_webhook) { true }

      reply_to = SecureReplyTo.new('news_feed_item', nfi.id, user.username).to_s

      post :reply,
        'To' => "#{nfi.id} <#{reply_to}>",
        'stripped-text' => 'An insightful comment'
    end

    it "returns 200" do
      expect(response.response_code).to eq(200)
    end

    it 'saves a new comment' do
      expect(nfi.comments.order(:created_at).last.body).to eq('An insightful comment')
    end

  end

end
