require 'spec_helper'

describe GlobalInterest do
  describe '#interest_is_approved' do
    let(:user) { User.make! }

    it 'sets a timestamp for an approved interest' do
      expect(GlobalInterest.create!(user: user, design: Time.now).design).to be_within(10).of(Time.now)
    end
  end
end
