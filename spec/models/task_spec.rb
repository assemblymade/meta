require 'spec_helper'

describe Task do
  let(:worker) { User.make! }
  let(:task) { Task.make! }
  let(:product) { task.product }
  let(:core_member) { User.make! }
  let(:comment) { NewsFeedItemComment.make!(body: 'TROGDOR', user: worker) }

  before {
    product.team_memberships.create!(user: core_member, is_core: true)
  }

  describe 'allocate' do
    it 'creates assign Activity' do
      expect { task.allocate!(worker) }.to change(Activity, :count).by(1)
    end
  end

  describe "#value" do

    it "defaults to 0" do
      expect(task.value).to eq(0)
    end

    it "increments with a single offer" do
      TransactionLogEntry.minted!(nil, Time.now, product, core_member.id, 1)
      Offer.create!(bounty: task, user: core_member, amount: 100, ip: '1.1.1.1')
      expect(task.value).to eq(100)
    end

  end

  describe "award" do
    it "creates award Activity but does not resolve the task" do
      expect { task.award!(core_member, comment) }.to change(Activity, :count).by(1)
      expect(task.resolved?).to be_falsy
    end

    it 'allows for awarding more than once' do
      task.award!(core_member, comment)
      task.award!(core_member, comment)

      expect(task).to be_awarded
    end
  end

  describe "#lock_bounty!" do
    it "holds the bounty for the given user" do
      task.lock_bounty!(worker)
      expect(task.locked_at).to be_within(2).of(Time.now)
    end
  end

  describe '#start_work!' do
    it "locks the bounty if it isn't locked" do
      task.start_work!(worker)
      expect(task.locked_at).to be_within(2).of(Time.now)
      expect(task.locked_by).to eq(worker.id)
    end

    it "does not lock the bounty if it's already locked" do
      task.lock_bounty!(core_member)
      task.start_work!(worker)
      expect(task.locked_by).to eq(core_member.id)
    end
  end

  describe "#unlock_bounty!" do
    it "releases the bounty for other workers" do
      task.lock_bounty!(worker)
      expect(task.locked_at).to be_within(2).of(Time.now)
      task.unlock_bounty!
      expect(task.locked_at).to be_nil
    end
  end

  describe "award and close" do
    it "transitions to resolved" do
      expect { task.award!(core_member, comment) }.to change(Activity, :count).by(1)
      expect(task.resolved?).to be_falsy
      expect(task.awarded?).to be_truthy

      task.close!(core_member)

      expect(task.resolved?).to be_truthy
    end
  end

  describe 'close' do
    it "creates award Activity and resolves the task" do
      expect { task.close!(core_member) }.to change(Activity, :count).by(1)
      expect(task.closed?).to be_truthy
    end
  end
end
