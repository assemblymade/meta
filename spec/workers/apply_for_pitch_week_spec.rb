require 'spec_helper'

describe ApplyForPitchWeek do
  let(:product) { Product.make! }

  describe '#perform' do
    it 'creates a pitch week application' do
      expect {
        subject.perform(product.id, product.user.id)
      }.to change(PitchWeekApplication, :count).by(1)
    end
  end
end
