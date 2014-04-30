module CoinsHelper

  def cents_to_coins(cents)
    coins = cents / 100.to_d
    number_with_precision(coins, precision: (coins.round == coins ? 0 : 2), delimiter: ',')
  end

end
