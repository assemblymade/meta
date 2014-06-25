require 'spec_helper'

describe Invite do
  let(:invitor) { User.make! }
  let(:bounty) { Task.make! }
  let(:product) { bounty.product }

  describe '#create_and_send' do
    context 'with insufficient coins' do
      it 'fails' do
        invite = create_invite
        credit = TransactionLogEntry.find_by(user_id: invite.id)
        expect(credit).to be_nil
      end
    end

    context 'with enough coins' do
      before {
        TransactionLogEntry.minted!(SecureRandom.uuid, Time.now, product, bounty.id, invitor.id, 60000)
      }

      it 'transfers tip to an escrow wallet' do
        invite = create_invite
        credit = TransactionLogEntry.find_by(user_id: invite.id)
        expect(credit.cents).to eq(50000)
        expect(TransactionLogEntry.balance(product, invitor)).to eq(60000-50000)
      end

      it 'emails invitee' do
        invite = create_invite
        expect(
          Sidekiq::Extensions::DelayedMailer.jobs.size
        ).to eq(1)
      end
    end
  end
  
  def create_invite(options={})
    attributes = {
      invitor: invitor,
      username_or_email: 'ben@tatooine.com',
      note: 'help me obi wan kenobi',
      tip_cents: 50000,
      via_type: Task.to_s, via_id: bounty.id
    }.merge(options)

    Invite.create_and_send(attributes)
  end
end

