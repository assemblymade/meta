require 'spec_helper'

describe Perk do
  describe '#discount_percent_off' do
    it 'returns the discount as a percentage of the amount' do
      perk = Perk.new(amount: 10000)

      perk.stub(discount_amount: 5000)

      expect(perk.discount_percent_off).to eq(50)
    end
  end
end
