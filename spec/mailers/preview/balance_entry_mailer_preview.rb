class BalanceEntryMailerPreview < ActionMailer::Preview

  def new_balance
    ProfitReport.group(:end_at).count.keys.each do |end_at|
      user_ids = User::BalanceEntry.joins(:profit_report).
        where('profit_reports.end_at = ?', end_at).
        group(:user_id).count.keys

      User.where(id: user_ids).shuffle.each do |user|
        balance = User::Balance.new(user)

        if !user.staff? && balance.available_earnings > 0
          balance_entry_ids = User::BalanceEntry.joins(:profit_report).
                where('profit_reports.end_at = ?', end_at).
                where(user_id: user.id).
                pluck(:id)

          return UserBalanceMailer.new_balance(balance_entry_ids)
        end
      end
    end
  end
end
