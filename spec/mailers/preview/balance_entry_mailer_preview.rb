class BalanceEntryMailerPreview < ActionMailer::Preview

  def new_balance
    report = ProfitReport.order(end_at: :desc).first

    ids = User::BalanceEntry.joins(:profit_report).
      where('profit_reports.end_at = ?', report.end_at).
      where(user_id: report.user_balances.sample.user_id).
      pluck(:id)

    UserBalanceMailer.new_balance(ids)
  end

end
