require 'spec_helper'

describe Behavioral do
  let(:user_1) { User.make(id: Fake.uuid(1), created_at: 48.hours.ago) }
  let(:user_2) { User.make(id: Fake.uuid(2), created_at: 2.hours.ago) }
  let(:user_3) { User.make(id: Fake.uuid(3), created_at: 2.hours.ago) }
  let(:user_4) { User.make(id: Fake.uuid(4), created_at: 2.hours.ago)  }
  let(:users) { [user_1, user_2, user_3, user_4] }

  subject { Behavioral.new }

  context 'idle_1 email' do
    before do
      user_2.products << Product.make(created_at: Time.now, pitch: 'pitch', description: 'description', suggested_perks: 'perks')
      user_3.votes.build
    end

    it 'matches correct user' do
      matched = subject.emails_matching(users)

      matched.should =~ [{
        user_id: user_1.id,
        view: 'idle_1',
      }]
    end

    it 'only matches once' do
      subject.emails_matching(users)

      subject.
        emails_matching(users).
        should =~ []
    end
  end

  context 'created_idea_missing_fields email' do
    let(:product) { Product.make(created_at: 3.hours.ago) }
    before do
      user_1.products << product
    end

    it 'matches correct user' do
      matched = subject.emails_matching(users)

      matched.should =~ [{
        user_id: user_1.id,
        view: 'created_idea_missing_fields',
        values: [product],
      }]
    end
  end

  describe 'product_missing_fields' do
    product = Product.make
    product.pitch = nil
    Behavioral.product_missing_fields(product).should =~ [
      :pitch, :description, :suggested_perks
    ]
  end

  describe 'truthy' do
    it 'is true for non-empty arrays and true' do
      Behavioral.truthy(false).should == false
      Behavioral.truthy(nil).should == false
      Behavioral.truthy([]).should == false
      Behavioral.truthy(true).should == []
      Behavioral.truthy(['sup']).should == ['sup']
    end
  end
end