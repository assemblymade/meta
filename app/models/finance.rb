class Finance

  def revenue_reports(product)
    pr = product.profit_reports.order(end_at: :asc)
    profits = ["Profits"]
    expenses = ["Expenses"]
    platforms = ["PlatformCosts"]
    dates = ['Dates']

    pr.each do |a|
      profit = a.revenue - a.expenses
      platform = (0.1 * profit).to_i
      profit = (profit - platform).to_i

      profits.append(profit.to_f/100)
      expenses.append(a.expenses.to_f/100)
      platforms.append(platform.to_f/100)
      dates.append(a.end_at)
    end
    [profits, expenses, platforms, dates]
  end

end
