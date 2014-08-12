class Admin::WithdrawalsController < AdminController
  respond_to :html

  def index
    @withdrawals = User::Withdrawal.all.order(created_at: :desc)
  end

  def payment_sent
    @withdrawal = User::Withdrawal.find(params[:withdrawal_id])
    @withdrawal.update(payment_sent_at: Time.now)
    respond_with(@withdrawal, location: admin_withdrawals_path)
  end
end
