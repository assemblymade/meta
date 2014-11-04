module BountyGuidance
  class Valuations

    BOUNTIES_PER_HALFWAY_SIGMOID = 8.0
    SIGMOID_BASELINE_CONSTANT = 0.0001
    SIGMOID_AVERAGE_MAX_CONSTANT = 0.02
    MIDPOINTS_N = 5
    EXPONENTIAL_INCREMENT = 2.0
    FEE = 0.10

    MEDIAN_DOLLAR_BOUNTY_VALUE = 25


    MAX_PROFIT_REPORTS_TO_CONSIDER = 30  #maximum number of months of profit backhistory to query

    def work_done(product)
      product.tasks.won.count
    end

    def product_profits_yearly(product)  #averaged and extrapolated
      profit_reports = product.profit_reports
      sumvalue = 0

      if profit_reports.count >MAX_PROFIT_REPORTS_TO_CONSIDER
        start = profit_reports.count - MAX_PROFIT_REPORTS_TO_CONSIDER
        theend = profit_reports.count
        profit_reports = profit_reports[start, theend]
      end

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

    def coins_for_profit_after_dilution(product, yearly_profit)
      sum_coins_awarded(product) * yearly_profit / (product_profits_yearly(product) - yearly_profit)
    end

    def get_unvested_coins(product)
      #product.unvested_coins
      10000000
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
      factor = 2 * (SIGMOID_AVERAGE_MAX_CONSTANT) / (1.0 + 3.0 ** (work_done(product) / BOUNTIES_PER_HALFWAY_SIGMOID )) + SIGMOID_BASELINE_CONSTANT
    end

    def compute_guidance(product, increment) #increment should be 0-4
      if product.state == 'profitable'
        dollar_target = EXPONENTIAL_INCREMENT**(increment-2) * MEDIAN_DOLLAR_BOUNTY_VALUE
        coins_for_profit_after_dilution(product, dollar_target)
      else
        sigmoid = adjusted_work_weight(product)
        incremented = sigmoid * EXPONENTIAL_INCREMENT ** (increment - MIDPOINTS_N / 2)
        outcome = incremented * get_unvested_coins(product)
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
        puts position
        results.append(list[position])
      end
      results
    end

  end
end
