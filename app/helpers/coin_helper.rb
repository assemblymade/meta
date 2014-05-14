module CoinHelper

  def cents_to_coins(cents)
    coins = cents / 100.to_d
    number_with_precision(coins, precision: (coins.round == coins ? 0 : 2), delimiter: ',')
  end

  def format_coins(product, cents)
    content_tag(
      :span,
      [
        content_tag(:span, nil, class: 'icon icon-app-coin'),
        "#{cents_to_coins(cents)} #{product.name} coins"
      ].join.html_safe,
      class: 'text-coins'
    )
  end

end
