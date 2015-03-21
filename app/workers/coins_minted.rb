class CoinsMinted
  include Sidekiq::Worker
  sidekiq_options queue: 'critical'

  attr_reader :entry, :product, :bounty

  def perform(minted_entry_id)
    @entry = TransactionLogEntry.find(minted_entry_id)
    @product = @entry.product
    @award = Award.find(@entry.wallet_id)
    @bounty = @award.wip
    @winner = @award.winner

    return unless @winner.present? # older wips may not have a winner if they were awarded, but re-opened

    transfer_coins_to_user_wallets!

    @product.update_partners_count_cache
    @bounty.update_coins_cache!

    @product.save!
  end

  def transfer_coins_to_user_wallets!
    entry.with_lock do
      entry_balance = entry.cents

      tip_entries = bounty.contracts.tip_contracts.each do |contract|
        tip = contract.percentage.to_f * entry.cents

        entry_balance -= tip

        TransactionLogEntry.transfer!(product,
            from = @award.id,
              to = contract.user.id,
           cents = tip,
             via = entry.id
         )
      end

      TransactionLogEntry.transfer!(product,
          from = @award.id,
            to = @winner.id,
         cents = entry_balance,
           via = entry.id
       )
    end
  end
end
