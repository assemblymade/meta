require 'spec_helper'

describe Wip do
  let(:owner) { User.make! }
  let(:product) { Product.make! }
  let(:wip) { Task.make!(user: owner, product: product) }
  let(:voter) { User.make! }
  let(:winner) { User.make! }
  let(:closer) { User.make! }
  let(:winning_event) { Event::Comment.make!(wip: wip, user: winner) }

  let(:joe_random) { User.make!(is_staff: false) }
  let(:core_member) { user = User.make!; product.team_memberships.create(user: user, is_core: true); user }

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

      its(:current_state) { should == :resolved }
      its(:closed_at) { be_same_time_as Time.current }
    end

    context 'closing' do
      before {
        wip.close! closer, 'not enough cats'
        wip.reload
      }

      its(:current_state) { should == :resolved }
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

  describe 'promoting' do
    let(:start) { Time.local(1990) }
    before(:each) { Timecop.freeze(start) }
    after(:each) { Timecop.return }

    context 'non core member multiplies' do
      it 'raises' do
        expect { wip.multiply!(joe_random, 2.0) }.to raise_error(ActiveRecord::RecordNotSaved)
      end
    end

    context 'core member multiplies' do
      context 'with no previously promoted wips' do
        before {
          wip.multiply! core_member, 2.0
        }
        subject { wip }

        its(:multiplier) { should == 2.0 }
      end
    end
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
end
