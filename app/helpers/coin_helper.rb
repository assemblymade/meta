module CoinHelper

  def cents_to_coins(cents, options={})
    coins = cents / 100.to_d
    precision = options[:round] ? 0 : (coins.round == coins ? 0 : 2)
    number_with_precision(coins, precision: precision, delimiter: ',')
  end

  def format_coins(product, cents, format = :full, options={})
    label = currency = product.for_profit? ? 'coins' : 'karma'

    if product.for_profit?
      label = "#{product.name} #{currency}"
    end

    # coins = cents_to_coins(cents, options)
    coins = number_with_delimiter(cents.floor)

    text = case format
    when :tiny
      coins
    when :short
      "#{coins} #{currency}"
    else
      "#{coins} #{label}"
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
