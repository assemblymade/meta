require 'spec_helper'

describe Webhooks::ReadRaptorController do
  let(:user) { User.make! }
  let(:flagged_user) { User.make!(flagged_at: Time.now) }

  describe 'immediate' do
    context 'wip' do
      let(:product) { Product.make! }
      let(:wips) { [product.tasks.make!, product.tasks.make!] }
      let(:flagged_wip) { product.tasks.make!(user: flagged_user) }
      let(:comments) { [wips[0].news_feed_item.comments.make!, wips[1].news_feed_item.comments.make!] }
      let(:flagged_comment) { flagged_wip.news_feed_item.comments.make!(user: flagged_user) }

      describe 'successful' do
        before do
          wips.each{|w| NewsFeedItem.create_with_target(w) }
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

      describe 'unsuccessful' do
        it 'does not notify from a flagged user' do
          NewsFeedItem.create_with_target(flagged_wip)
          post :immediate,
            user: flagged_user.id,
            entity_id: flagged_wip.id,
            pending: ["Task_#{flagged_wip.id}", "Event::Comment_#{flagged_comment.id}"]

          expect_mail_not_queued(WipMailer, :wip_created, flagged_user.id, flagged_wip.id)
        end
      end
    end

    context 'nfi' do
      let(:target) { Post.make! }
      let(:nfi) { target.news_feed_item }
      let(:comment) { nfi.comments.create!(user: User.make!, body: 'hay hay') }
      let(:flagged_comment) { nfi.comments.create!(user: flagged_user, body: 'yo yo') }

      describe 'successful' do
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

      describe 'unsuccessful' do
        it 'does not notify from a flagged user' do
          post :immediate,
            user: flagged_user.id,
            entity_id: flagged_comment.id,
            pending: ["NewsFeedItemComment_#{flagged_comment.id}"]

          expect_mail_not_queued(CommentMailer, :new_comment, flagged_user.id, flagged_comment.id)
        end
      end
    end
  end
end
