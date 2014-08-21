require 'spec_helper'

describe AutoTipContract do
  let!(:product) { Product.make! }
  let!(:user) { User.make!(is_staff: true) }
  let(:other_user) { User.make! }

  describe '#one_contract_per_user' do
    before do
      AutoTipContract.create!(product: product, user: user, amount: 0.1)
    end

    it 'does not allow more than one contract' do
      AutoTipContract.create(product: product, user: user, amount: 0.1).should have(1).error_on(:user)
    end

    it 'allows a contract for a new user' do
      expect(AutoTipContract.create(product: product, user: other_user, amount: 0.1)).to be_a(AutoTipContract)
    end

    it 'does not allow a contract with an amount < 0' do
      AutoTipContract.create(product: product, user: user, amount: -10).should have(1).error_on(:amount)
    end
  end

  describe '#contracts_less_than_100_percent' do
    it 'does not allow contracts totaling more than 100%' do
      AutoTipContract.create(product: product, user: user, amount: 1.1).should have(1).error_on(:product)
    end
  end
end
