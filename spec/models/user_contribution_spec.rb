require 'spec_helper'

describe UserContribution do
  let(:user) { User.make! }
  let(:viewer) { User.make! }

  describe '.for' do
    it 'includes stealth products for own contribution' do
      stealth_product = Product.make!(launched_at: nil)

      TransactionLogEntry.create!(product_id: stealth_product.id, action: 'credit', cents: 500, wallet_id: user.id, work_id: SecureRandom.uuid)

      expect(
        UserContribution.for(user).map(&:product).map(&:id)
      ).to match_array([stealth_product.id])
    end

    it "filters out stealth products for other user's contribution" do
      stealth_product = Product.make!(launched_at: nil)
      launched_product = Product.make!

      [stealth_product, launched_product].each do |product|
        TransactionLogEntry.create!(product_id: product.id, action: 'credit', cents: 500, wallet_id: user.id, work_id: SecureRandom.uuid)
      end

      expect(
        UserContribution.for(user, true).map(&:product).map(&:id)
      ).to match_array([launched_product.id])
    end
  end
end
