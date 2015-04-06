require 'spec_helper'

describe Award do
  context 'pending' do
    let!(:award) { Award.make!(guest: guest) }
    let!(:guest) { Guest.make! }
    let!(:winner) { User.make! }

    describe '#claim!' do
      it 'sets winner' do
        award.claim!(winner)

        expect(award.winner).to eq(winner)
      end
    end
  end
end
