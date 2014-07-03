require 'spec_helper'

describe Stake::EntryMinter do
  let(:product) { Product.make! }
  let(:work) { Task.make!(product: product, user: worker) }
  let(:validator) { User.make! }
  let(:worker) { User.make! }
  let(:voter) { User.make! }
  let(:benefactor) { User.make! }

  it 'mints when validated work is voted on' do
    start_at = Time.now

    TransactionLogEntry.validated! start_at, product, work.id, validator.id, worker.id
    entry = TransactionLogEntry.voted! start_at + 1.second, product, work.id, voter.id

    minter = Stake::EntryMinter.new(product, entry)

    expect(
      minter.mint_coins!
    ).to have_attributes(
      product_id: product.id,
      action: 'minted',
      work_id: work.id,
      wallet_id: work.id,
      cents: 10000
    )
  end

  it 'mints when upvoted work is validated' do
    start_at = Time.now

    TransactionLogEntry.voted! start_at, product, work.id, voter.id
    entry = TransactionLogEntry.validated! start_at + 1.second, product, work.id, validator.id, worker.id

    minter = Stake::EntryMinter.new(product, entry)

    expect(
      minter.mint_coins!
    ).to have_attributes(
      product_id: product.id,
      action: 'minted',
      work_id: work.id,
      wallet_id: work.id,
      cents: 10000
    )
  end

  it 'honors the current multiplier' do
    start_at = Time.now

    TransactionLogEntry.voted! start_at, product, work.id, voter.id
    TransactionLogEntry.multiplied! start_at + 1.second, product, work.id, voter.id, 2
    entry = TransactionLogEntry.validated! start_at + 2.seconds, product, work.id, validator.id, worker.id

    minter = Stake::EntryMinter.new(product, entry)
    expect(
      minter.mint_coins!
    ).to have_attributes(
      product_id: product.id,
      action: 'minted',
      work_id: work.id,
      wallet_id: work.id,
      cents: 20000
    )
  end
end

