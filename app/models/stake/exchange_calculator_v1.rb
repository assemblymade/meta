module Stake
  class ExchangeCalculatorV1
    def rate_at(votes, at)
      # replay the history to get the exchange rate
      # TODO (whatupdave): this should be performance optimized
      mf = calculate_momentum_factor(votes, at)
      df = calculate_decay_factor(votes, at)

      (mf * df * 100).round
    end

    def calculate_momentum_factor(votes, at)
      return 1.0 if votes.size < 10

      @t0 ||= 60                 # Delta T (time in days) for exchange at 0.5
      @t1 ||= 20                 # Delta T (time in days) for exchange at epsilon
      @epsilon ||= 0.1           # exchange value at t1
      @vote_window ||= 1000      # look at the last 100 points

      @alpha ||= (1/(@t0 - @t1).to_f) * Math.log(1 / @epsilon - 1) # The slope of the sigmoid

      window = votes.last(@vote_window)

      time_diff = (at - window.first) / 60 / 60 / 24
      delta_t = (@vote_window / window.size.to_f) * time_diff
      1 / (1 + Math.exp(-@alpha * (delta_t - @t0)))
    end

    def calculate_decay_factor(votes, at)
      return 1.0 if votes.size == 0

      n = 7           # days in period
      smax = 2.5      # Max work increase (2.5 times the previous week)
      sq_alpha = 2    # squashed work slope
      rt = 1.05       # nominal work factor
      dmin = 0.25     # lowest decay factor
      sig0 = 52       # work units to get halfway to dmin ~ 1 year
      decay_alpha = 0.1 # slope of decay function

      @r0 ||= (1 / sq_alpha) * Math.log(smax - 1) + rt

      start_first = at - (n * 2).days
      start_last = at - n.days

      index1 = votes.index{|v| (v > start_first) && (v < start_last) }
      index0 = votes.index{|v| v > start_last }

      return 1.0 if index0.nil? || index1.nil?

      v0 = votes.size - index0
      v1 = votes.size - index1 - v0

      rf = v0 / v1.to_f

      s = smax / (1 + Math.exp(-sq_alpha * (rf - @r0))) # squashed work units

      1 - ((1 - dmin) / (1 + Math.exp(-decay_alpha * (s - sig0))))
    end
  end
end
