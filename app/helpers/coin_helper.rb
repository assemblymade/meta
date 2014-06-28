module CoinHelper

  def cents_to_coins(cents)
    coins = cents / 100.to_d
    number_with_precision(coins, precision: (coins.round == coins ? 0 : 2), delimiter: ',')
  end

  def format_coins(product, cents, format = :full)
    label = currency = product.for_profit? ? 'coins' : 'karma'

    if product.for_profit?
      label = "#{product.name} #{currency}"
    end

    text = case format
    when :tiny
      cents_to_coins(cents)
    when :short
      "#{cents_to_coins(cents)} #{currency}"
    else
      "#{cents_to_coins(cents)} #{label}"
    end

    content_tag(
      :span,
      [
        content_tag(:span, nil, class: 'icon icon-app-coin'),
        content_tag(:span, text, class: 'js-coins')
      ].join.html_safe,
      class: (product.for_profit? ? 'text-coins' : 'text-muted')
    )
  end

end
