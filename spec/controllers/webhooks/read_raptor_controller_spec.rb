require 'spec_helper'

describe Webhooks::ReadRaptorController do
  let(:user) { User.make! }

  describe 'immediate' do
    context 'wip' do
      let(:product) { Product.make! }
      let(:wips) { [product.tasks.make!, product.tasks.make!] }
      let(:comments) { [wips[0].comments.make!, wips[1].comments.make!] }

      before do
        post :immediate,
          user: user.id,
          entity_id: wips.first.id,
          pending: (wips.map{|o| "#{o.class}_#{o.id}" } + comments.map{|o| "#{o.class}_#{o.id}" })
      end

      it "returns 200" do
        expect(response.response_code).to eq(200)
      end

      it 'notifies by email' do
        expect_mail_queued(WipMailer, :wip_created, user.id, wips.first.id)
      end
    end

    context 'nfi' do
      let(:target) { Post.make! }
      let(:nfi) { target.news_feed_item }
      let(:comment) { nfi.comments.create!(user: User.make!, body: 'hay hay') }

      before do
        post :immediate,
          user: user.id,
          entity_id: comment.id,
          pending: ["NewsFeedItemComment_#{comment.id}"]
      end

      it 'notifies by email' do
        expect_mail_queued(CommentMailer, :new_comment, user.id, comment.id)
      end
    end
  end
end
