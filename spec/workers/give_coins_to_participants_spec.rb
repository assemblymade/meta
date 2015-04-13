require 'spec_helper'

describe GiveCoinsToParticipants do
  let!(:user) { User.make! }
  let!(:idea) { Idea.make!(product_id: product.id) }
  let!(:product) { Product.make! }

  describe '#perform' do
    before {
      GiveCoinsToParticipants.new.perform([user.id], product.id, coins_each=10)
    }
    it 'give coins to users' do
      expect(
        TransactionLogEntry.order(:created_at).pluck(:action, :cents)
      ).to eq([
        ['minted', 10],
        ['credit', 10],
        ['debit', -10],
        ['minted', 10],
        ['credit', 10],
        ['debit', -10],
      ])
    end
  end
end
