class UserBalanceMailer < BaseMailer
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::NumberHelper
  include CurrencyHelper
  add_template_helper(CoinHelper)
  add_template_helper(CurrencyHelper)

  layout 'email'

  def new_balance(balance_entry_ids)
    @balance_entries = User::BalanceEntry.where(id: balance_entry_ids).includes(:profit_report, :user)
    @earnings = @balance_entries.sum(:earnings)
    @end_at = @balance_entries.first.profit_report.end_at
    @user = @balance_entries.first.user

    mail to: @user.email_address,
         subject: "You earned #{currency @earnings} on Assembly in #{I18n.l @end_at, format: :month}"
  end

  def withdrawal_created(withdrawal_id)
    @withdrawal = User::Withdrawal.find(withdrawal_id)
    @user = @withdrawal.user

    mail to: 'withdrawals@assembly.com',
         subject: "withdrawal requested from #{@user.username} for #{currency @withdrawal.amount}"
  end

end
