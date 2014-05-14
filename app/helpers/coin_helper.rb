module CoinHelper

  def cents_to_coins(cents)
    coins = cents / 100.to_d
    number_with_precision(coins, precision: (coins.round == coins ? 0 : 2), delimiter: ',')
  end

  def format_coins(product, cents)
    content_tag(
      :span,
      "#{cents_to_coins(cents)} #{product.name} coins",
      class: 'text-coins'
    )
  end

end
