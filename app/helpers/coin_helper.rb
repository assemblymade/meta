module CoinHelper

  def cents_to_coins(cents)
    coins = cents / 100.to_d
    number_with_precision(coins, precision: (coins.round == coins ? 0 : 2), delimiter: ',')
  end

  def format_coins(product, cents, format = :full)
    label = if product.for_profit?
      "#{product.name} coins"
    else
      'karma'
    end

    text = case format
    when :short
      cents_to_coins(cents)
    else
      "#{cents_to_coins(cents)} #{label}"
    end

    content_tag(
      :span,
      [
        content_tag(:span, nil, class: 'icon icon-app-coin'),
        text
      ].join.html_safe,
      class: (product.for_profit? ? 'text-coins' : 'text-muted')
    )
  end

end
