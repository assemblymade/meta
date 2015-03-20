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

  def give_coins_to_participants(chosen_participants, product, coins_each=1)
    author = product.user
    idea = Idea.find_by(product_id: product.id)
    if chosen_participants.count > 0
      title = "Participate in the Idea stage of #{product.name}"
      t = Task.create!({title: title, user: author, product: product, earnable_coins_cache: coins_each})
      chosen_participants.each do |p|
        event = idea.news_feed_item.comments.where(user_id: p.id)
        if event.count == 0
          event = idea.news_feed_item.hearts.where(user_id: p.id)
        end
        if event.count > 0
          t.award(author, event.first)
        end
      end
    end
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
