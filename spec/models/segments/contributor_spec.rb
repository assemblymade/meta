require 'spec_helper'

describe Segment::Contributor do
  let(:product_owner) { User.make!(name: 'Product Owner') }
  let(:contributor) { User.make!(name: 'Contributor') }
  let(:noob) { User.make!(name: 'noob') }
  let(:product) { Product.make!(user: product_owner ) }

  subject { Segment::Contributor.new }

  it "doesn't contain noob" do
    subject.contains?(noob).should be_false
  end

  context 'started a discussion' do
    before { Discussion.make!(product: product, user: contributor) }

    it 'contains contributor' do
      subject.contains?(contributor).should be_true
    end
  end

  context 'won a wip' do
    let(:wip) { Task.make!(product: product, user: contributor) }
    let(:comment) { Event::Comment.make!(user: contributor, wip: wip)}
    before { wip.award!(noob, comment) }

    it 'contains contributor' do
      subject.contains?(contributor).should be_true
    end
  end

  context 'has 3 comments' do
    let(:wip) { Task.make!(product: product, user: noob) }
    before { 3.times { Event::Comment.make!(user: contributor, wip: wip) } }

    it 'contains contributor' do
      subject.contains?(contributor).should be_true
    end
  end

end
