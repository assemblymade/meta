require 'spec_helper'

describe 'log entries' do
  let(:product) { Product.make! }
  let(:creator) { product.user }
  let(:bounty_creator) { User.make! }

  context 'bounty awarded' do
    let(:bounty) { Task.make! product: product, user: bounty_creator }
    let(:winning_event) { Event::Comment.new(body: 'Dagron', user: bounty_creator) }

    before {
      TransactionLogEntry.minted!(nil, Time.now, product, product.id, creator.id, 1)
      Offer.create!(bounty: bounty, user: creator, amount: 100, ip: '1.1.1.1')
      bounty.events << winning_event
    }

    it 'creates mint entry' do
      bounty.award(product.user, winning_event)

      expect(
        TransactionLogEntry.minted.where(work_id: bounty.id).pluck(:action, :wallet_id, :cents)
      ).to match_array([['minted', bounty_creator.id, 100]])
    end

    it 'credits bounty creator' do
    end

  end

  context 'transfer entries from tipping' do
    let(:bounty) { Task.make! product: product, user: bounty_creator }
    let(:comment) { Activity.make! }
    let(:from) { User.make! }

    it 'creates debit and credit when task is promoted' do
      TransactionLogEntry.minted!(SecureRandom.uuid, Time.now, product, bounty.id, from.id, 3)

      Timecop.travel(Time.now + 5)

      Tip.perform!(product, from, comment, 3)

      entries = TransactionLogEntry.order('created_at desc').take(2)
      expect(
        entries[0]
      ).to have_attributes(
          product_id: product.id,
          action: 'credit',
          work_id: comment.id,
          wallet_id: comment.actor.id,
          cents: 3
      )
      expect(
        entries[1]
      ).to have_attributes(
          product_id: product.id,
          action: 'debit',
          work_id: comment.id,
          wallet_id: from.id,
          cents: -3
      )
    end
  end
end
