require 'spec_helper'

describe Invite do
  let(:invitor) { User.make! }
  let(:invitee) { User.make! }
  let(:bounty) { Task.make! }
  let(:product) { bounty.product }

  describe '#create_and_send' do
    context 'with insufficient coins' do
      it 'fails' do
        invite = create_invite
        credit = TransactionLogEntry.find_by(wallet_id: invite.id)
        expect(credit).to be_nil
      end
    end

    context 'with enough coins' do
      before {
        TransactionLogEntry.minted!(SecureRandom.uuid, Time.now, product, invitor.id, 100)
      }

      it 'transfers tip from user' do
        expect {
          create_invite
        }.to change{TransactionLogEntry.balance(product, invitor.id)}.by(-100)
      end

      it 'transfers tip to escrow' do
        invite = create_invite
        expect(TransactionLogEntry.balance(product, invite.id)).to eq(100)
      end

      it 'emails invitee' do
        invite = create_invite
        expect(
          Sidekiq::Extensions::DelayedMailer.jobs.size
        ).to eq(1)
      end
    end
  end

  describe '#claim!' do
    before {
      TransactionLogEntry.minted!(SecureRandom.uuid, Time.now, product, invitor.id, 100)
    }

    it 'transfers coins from escrow to user' do
      invite = create_invite(tip_cents: 100)
      expect {
        invite.claim!(invitee)
      }.to change{TransactionLogEntry.balance(product, invitee)}.by(100)
    end

    it 'sets claimed_at timestamp' do
      invite = create_invite(tip_cents: 100)
      invite.claim!(invitee)

      expect(invite.reload.claimed_at).to be_within(1).of(Time.current)
    end

    it 'sets invitee' do
      invite = create_invite(tip_cents: 100)
      invite.claim!(invitee)

      expect(invite.reload.invitee).to eq(invitee)
    end

    it 'adds invitee to core team if requested' do
      invite = create_invite(core_team: true)
      invite.claim!(invitee)

      expect(product.core_team).to include(invitee)
    end
  end

  def create_invite(options={})
    attributes = {
      invitor: invitor,
      username_or_email: 'ben@tatooine.com',
      note: 'help me obi wan kenobi',
      tip_cents: 100,
      via_type: Task.to_s, via_id: bounty.id
    }.merge(options)

    Invite.create_and_send(attributes)
  end
end

