require 'spec_helper'

describe PerkDecorator do
  describe "#formatted_amount" do
    it 'tells the user if they pre-ordered a perk' do
      perk = Perk.new
      decorator = PerkDecorator.new(perk)
      user = double(preordered_perk?: true)

      expect(decorator.formatted_amount(user)).to eq('Pre-ordered')
    end

    it 'asks the user to pre-order the perk if they have not already' do
      perk = Perk.new
      decorator = PerkDecorator.new(perk)
      user = double(preordered_perk?: false)

      perk.stub(discount_amount: 5000)

      expect(decorator.formatted_amount(user)).to eq('Pre-order for $50')
    end
  end
end
