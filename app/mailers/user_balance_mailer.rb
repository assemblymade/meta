class TipMailer < BaseMailer
  include ActionView::Helpers::TextHelper

  layout 'email'

  def new_balance(balance_entry_ids)
    @balance_entries = User::BalanceEntry.where(id: balance_entry_ids)
    @earnings = @balance_entries.sum(:earnings)
    @report =

    mail to: @user.email_address,
         subject: "You earned #{currency @earnings} on Assembly in #{i18n. Time.now, format: :short}"
  end

end
