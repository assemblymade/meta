require 'spec_helper'

describe Wip do
  let(:owner) { User.make! }
  let(:product) { Product.make! }
  let(:wip) { Task.make!(user: owner, product: product).tap{|t| NewsFeedItem.create_with_target(t) } }
  let(:voter) { User.make! }
  let(:winner) { User.make! }
  let(:closer) { User.make! }
  let(:winning_event) { NewsFeedItemComment.make!(news_feed_item: nfi, user: winner) }
  let(:nfi) { wip.news_feed_item }

  let(:joe_random) { User.make!(is_staff: false) }
  let(:core_member) { user = User.make!; product.team_memberships.create(user: user, is_core: true); user }

  describe '#notify_by_email' do
    before do
      WipMailer.stub(:delay).and_return(WipMailer)
    end

    it 'only sends once per user' do
      expect(WipMailer).to receive(:wip_created).once

      wip.notify_by_email(owner)
      wip.notify_by_email(owner)
    end
  end

  describe 'states' do
    subject { wip }

    context 'allocation' do
      before {
        wip.start_work! joe_random
        subject.reload
      }

      its(:current_state) { should == :allocated }
      its(:workers) { should =~ [joe_random];  }
    end

    context 'review_me' do
      before {
        wip.allocate! joe_random
        wip.review_me! joe_random
        wip.reload
      }
      its(:current_state) { should == :reviewing }
    end

    context 'awarding' do
      before {
        wip.allocate! joe_random
        wip.review_me! joe_random
        wip.award! closer, winning_event
        wip.votes.create! user: winner, ip: '1.2.3.4'
        wip.reload
      }

      its(:current_state) { should == :awarded }
      its(:closed_at) { be_same_time_as Time.current }
    end

    context 'closing' do
      before {
        wip.close! closer, 'not enough cats'
        wip.reload
      }

      its(:current_state) { should == :closed }
      its(:closed_at) { be_same_time_as Time.current }

      it 'creates activity' do
        expect(Activities::Close.first.target).to eq(wip)
      end
    end

    context 'reopen' do
      before {
        wip.close! closer, 'not enough cats'
        wip.reopen! closer, 'actually, there are enough cats'
        wip.reload
      }

      its(:current_state) { should == :open }
      its(:closed_at) { should be_nil }

      it 'creates activity' do
        expect(Activities::Open.first.target).to eq(wip)
      end
    end
  end

  it 'can be voted' do
    wip.votes.create! user: voter, ip: '1.2.3.4'
    wip.votes.count == 1
  end

  describe '#update_tag_list' do
    before {
      wip.tag_list = 'code,design'
      wip.save!

      wip.update_tag_names!(owner, %w(ui,testing))
    }

    it 'creates event' do
      tag_change = wip.events.last
      tag_change.from.should =~ %w(code design)
      tag_change.to.should =~ %w(ui testing)
    end
  end

  describe '#update_news_feed_item' do
    it 'calls #update_news_feed_item' do
      Wip.any_instance.stub(:update_news_feed_item)
      expect(wip).to receive(:update_news_feed_item)

      wip.update(title: 'A History of the World')
    end
  end
end
