require 'spec_helper'

describe InvitesController do

  describe '#create' do
    let(:bounty) { Task.make! }
    let(:invitor) { User.make! }

    context 'with email' do
      before do
        sign_in invitor
        post :create, format: :json,
          invite: {
            username_or_email: 'ben@tatooine.com',
            note: 'help me obi wan kenobi',
            tip_cents: 50000,
            via_type: Task.to_s, via_id: bounty.id
          }
      end

      it 'validates' do
        expect(assigns(:invite)).to be_valid
      end

      it 'creates an invite' do
        expect(assigns(:invite)).to be_persisted
      end
    end
  end
end
