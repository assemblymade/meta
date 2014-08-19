module CurrencyHelper

  def amount_to_currency(amount, options={})
    options[:precision] ||= (amount % 100) == 0 ? 0 : 2
    number_to_currency (amount / 100.0), options
  end

  alias_method :currency, :amount_to_currency

  def discount(discounted_cost, full_cost)
    amount = 1 - (discounted_cost / full_cost.to_f)
    "#{(amount * 100).to_i}%"
  end

  def short_currency(val)
    val ||= 0

    val = val / 100.0

    "$#{val.round(-3)/1000}K"
  end

end
