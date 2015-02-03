module CoinHelper

  def format_coins(product, cents, format = :full, options={})
    label = currency = product.for_profit? ? 'coins' : 'karma'

    if product.for_profit?
      label = "#{product.name} #{currency}"
    end

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
      class: (product.for_profit? ? 'yellow' : 'gray-2')
    )
  end

  def number(val)
    number_with_delimiter(val)
  end

  def percentage(val, opts={})
    number_to_percentage(val * 100.0, precision: opts[:precision] || 2)
  end
end
