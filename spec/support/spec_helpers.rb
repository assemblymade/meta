module SpecHelpers
  def mint_coins(product, user, coins)
    TransactionLogEntry.minted!(nil, Time.now, product, user.id, coins)
  end
end