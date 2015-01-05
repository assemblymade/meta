require 'spec_helper'

describe ApplyForPitchWeek do
  let(:product) { Product.make! }

  describe '#perform' do
    it 'creates a pitch week application' do
      expect {
        subject.perform(product.id, product.user.id)
      }.to change(PitchWeekApplication, :count).by(1)
    end

    it 'sends an email about the product awaiting approval' do
      email = double('Email')
      application = double(id: 1)

      allow(PitchWeekApplication).to receive(:create!) { application }

      expect(PitchWeekMailer).to receive(:awaiting_approval).with(application.id) { email }
      expect(email).to receive(:deliver_now)

      subject.perform(product.id, product.user.id)
    end
  end
end
