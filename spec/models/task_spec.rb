require 'spec_helper'

describe Task do
  let(:worker) { User.make! }
  let(:task) { Task.make! }
  let(:product) { task.product }
  let(:core_member) { User.make! }
  let(:comment) { task.comments.create!(body: 'TROGDOR', user: worker) }

  before {
    product.core_team_memberships.create!(user: core_member)
  }

  describe 'deliverable' do
    it 'is required' do
      expect { Task.make!(deliverable: nil) }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end

  describe 'allocate' do
    it 'creates assign Activity' do
      expect { task.allocate!(worker) }.to change(Activity, :count).by(1)
    end
  end

  describe 'award' do
    it 'creates award Activity' do
      expect { task.award!(core_member, comment) }.to change(Activity, :count).by(1)
    end
  end
end
