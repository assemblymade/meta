require 'spec_helper'

describe Task do
  let(:worker) { User.make! }
  let(:task) { Task.make! }
  let(:product) { task.product }
  let(:core_member) { User.make! }
  let(:comment) { task.comments.create!(body: 'TROGDOR', user: worker) }

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
      expect(task.resolved?).to be_false
    end

    # it "increments"

  end

  describe 'close' do
    it "creates award Activity and resolves the task" do
      expect { task.close!(core_member) }.to change(Activity, :count).by(1)
      expect(task.resolved?).to be_true
    end
  end
end
