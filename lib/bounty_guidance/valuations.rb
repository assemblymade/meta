module BountyGuidance
  class Valuations

    BOUNTIES_PER_HALFWAY_SIGMOID = 100.0
    SIGMOID_BASELINE_CONSTANT = 0.0001
    SIGMOID_AVERAGE_MAX_CONSTANT = 0.002
    MIDPOINTS_N = 5
    EXPONENTIAL_INCREMENT = 2.0
    FEE = 0.10

    MEDIAN_DOLLAR_BOUNTY_VALUE = 75

    MAX_PROFIT_REPORTS = 30  #maximum number of months of profit backhistory to query

    def self.suggestions(product)
      (0..4).map do |i|
        suggestion = new.compute_guidance(product, i)

        if suggestion < 1000
          suggestion.round(-2)
        else
          suggestion.round(-3)
        end
      end
    end

    def work_done(product)
      product.tasks.won.count
    end

    def product_profits_yearly(product)  #averaged and extrapolated
      profit_reports = product.profit_reports.limit(MAX_PROFIT_REPORTS)
      sumvalue = 0

      profit_reports.each do |profit_report|
        if profit_reports.last.annuity==0
          sumvalue = sumvalue + (profit_report.revenue - profit_report.expenses) * (1.0-FEE)
        else
          if profit_report.annuity < profit_report.revenue -  profit_report.expenses
            sumvalue = sumvalue + (profit_report.revenue - profit_report.expenses - profit_report.annuity) * (1.0-FEE)
          end
        end
      end

      if profit_reports.count>0
        sumvalue = sumvalue / profit_reports.count * 12 / 100
      else
        sumvalue = 0
      end
    end

    def profits_per_coin(product)
      product_profits_yearly(product) / sum_coins_awarded(product)
    end

    def estimated_flat_coin_value(product, price_to_earnings_ratio)
      profits_per_coin(product) * price_to_earnings_ratio
    end

    def coins_for_profit_after_dilution(product, yearly_profit)
      sum_coins_awarded(product) * yearly_profit / (product_profits_yearly(product) - yearly_profit)
    end

    def unvested_coins(product)
      product.unvested_coins
    end

    def sum_coins_awarded(product)
      TransactionLogEntry.where(product_id: product.id).sum(:cents)
    end

    def sum_coins_awarded_as_of(product, datetime)
      tasks = product.tasks.won.where('closed_at < ?', datetime)
      sumvalue = 0
      tasks.each do |task|
        sumvalue = sumvalue + task.total_coins_cache
      end
      sumvalue.to_f
    end

    def bounty_fraction_distribution(product)
      total_coins = sum_coins_awarded(product)
      distribution = []
      product.tasks.won.each do |task|
        distribution.append(task.total_coins_cache.to_f / (sum_coins_awarded_as_of(product, task.closed_at) +task.total_coins_cache.to_f) )
      end
      return distribution
    end

    def all_fraction_distribution()
      products = Product.where(state: ['greenlit', 'profitable'])
      fraction_list = []
      products.each do |product|
        fraction_list = fraction_list + bounty_fraction_distribution(product)
      end
      fraction_list.sort!
      fraction_list
    end

    def adjusted_work_weight(product)
      factor = 0.5020 * 2 * (SIGMOID_AVERAGE_MAX_CONSTANT) / (1.0 + 3.0 ** (work_done(product) / BOUNTIES_PER_HALFWAY_SIGMOID - 5)) + SIGMOID_BASELINE_CONSTANT
    end

    def compute_guidance(product, increment) #increment should be 0-4
      if product.state == 'profitable' && product_profits_yearly(product) > 0
        dollar_target = EXPONENTIAL_INCREMENT**(increment-2) * MEDIAN_DOLLAR_BOUNTY_VALUE
        coins_for_profit_after_dilution(product, dollar_target)
      else
        sigmoid = adjusted_work_weight(product)
        incremented = sigmoid * EXPONENTIAL_INCREMENT ** (increment - MIDPOINTS_N / 2)
        outcome = incremented * unvested_coins(product)
        outcome
      end
    end


    def find_midpoints_product(product)
      bounty_value_history = []
      product.tasks.won.each do |task|
        bounty_value_history.append(task.total_coins_cache)
      end
      bounty_value_history.sort!
      sumvalue = bounty_value_history.sum
      sum_section = sumvalue / (1.0 + MIDPOINTS_N)

      midpoints = []
      progress = 0.0

      bounty_value_history.each do |value|
        progress = progress + value
        if progress >= sum_section
          midpoints.append(value)
          progress = 0.0
        end
      end
      midpoints
    end

    def divide_by_medians(n_medians, list)
      list_length = list.count.to_f
      results = []
      (1..n_medians).step(1) do |n|
        position = ((n.to_f)/(n_medians.to_f+1.0)*list_length).to_i
        results.append(list[position])
      end
      results
    end

  end
end
