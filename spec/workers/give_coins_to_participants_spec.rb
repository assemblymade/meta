require 'spec_helper'

describe GiveCoinsToParticipants do
  let(:user) { User.make! }
  let(:product) { Product.make! }

  describe '#perform' do
    it 'give coins to users' do
      chosen_participant_ids = [user.id]

      expect {
        GiveCoinsToParticipants.new.perform(chosen_participant_ids, product.id, coins_each=10)
      }.to change(TransactionLogEntry, :count).by(1)
    end
  end
end
