class User::Balance
  attr_reader :user, :at

  def initialize(user, at=Time.now)
    @user = user
    @at = at
  end

  def balances
    @balances ||= User::BalanceEntry.
                    includes(:profit_report).
                    where(user: user).
                    order('profit_reports.end_at desc').to_a
  end

  def final_balances
    @final_balances ||= User::BalanceEntry.
                          includes(:profit_report).
                          where(user: user).
                          where('profit_reports.end_at < ?', at - ProfitReport.grace_period).
                          order('profit_reports.end_at desc').to_a
  end

  def final_earnings
    @final_earnings ||= (final_balances.map(&:earnings).reduce(:+) || 0)
  end

  def withdrawals
    @withdrawals ||= User::Withdrawal.where(user: user).order(created_at: :desc)
  end

  def previously_withdrawn
    @previously_paidout ||= withdrawals.sum(:total_amount)
  end

  def previously_withheld
    @previously_withheld ||= withdrawals.sum(:amount_withheld)
  end

  def previously_paidout
    previously_withdrawn - previously_withheld
  end

  def available_earnings
    final_earnings - previously_withdrawn
  end

  def available_to_withhold
    available_earnings * user.tax_info.withholding
  end

  def available_to_payout
    available_earnings - available_to_withhold
  end
end