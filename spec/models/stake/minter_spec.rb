require 'spec_helper'

describe Stake::Minter do
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

    minter = Stake::Minter.new(product)
    entries = minter.mint_coins!(entry)

    expect(
      entries.last
    ).to have_attributes(
      product_id: product.id,
      action: 'minted',
      work_id: work.id,
      user_id: worker.id,
      cents: 10000
    )
  end

  it 'mints when upvoted work is validated' do
    start_at = Time.now

    TransactionLogEntry.voted! start_at, product, work.id, voter.id
    entry = TransactionLogEntry.validated! start_at + 1.second, product, work.id, validator.id, worker.id

    minter = Stake::Minter.new(product)
    entries = minter.mint_coins!(entry)

    expect(
      entries.last
    ).to have_attributes(
      product_id: product.id,
      action: 'minted',
      work_id: work.id,
      user_id: worker.id,
      cents: 10000
    )
  end

  it 'honors the current multiplier' do
    start_at = Time.now

    TransactionLogEntry.voted! start_at, product, work.id, voter.id
    TransactionLogEntry.multiplied! start_at + 1.second, product, work.id, voter.id, 2
    entry = TransactionLogEntry.validated! start_at + 2.seconds, product, work.id, validator.id, worker.id

    minter = Stake::Minter.new(product)
    entries = minter.mint_coins!(entry)

    expect(
      entries.last
    ).to have_attributes(
      product_id: product.id,
      action: 'minted',
      work_id: work.id,
      user_id: worker.id,
      cents: 20000
    )
  end

  it 'honors tip contracts' do
    start_at = Time.now

    AutoTipContract.create!(product: product, user: product.user, amount: 0.025)
    AutoTipContract.create!(product: product, user: benefactor, amount: 0.025)
    TransactionLogEntry.validated! start_at + 0.seconds, product, work.id, validator.id, worker.id
    entry = TransactionLogEntry.voted! start_at + 1.second, product, work.id, voter.id

    minter = Stake::Minter.new(product)
    entries = minter.mint_coins!(entry)

    expect(
      entries.map(&:cents)
    ).to match_array([250, 250, 9500])
  end

end