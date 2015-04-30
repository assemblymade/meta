class Admin::WithdrawalsController < AdminController
  respond_to :html, :json

  def index
    @withdrawals = User::Withdrawal.all.order(created_at: :desc)
  end

  def update
    @withdrawal = User::Withdrawal.find(params[:id])
    @withdrawal.update(
      amount_withheld: (params[:amount_withheld].gsub('$','').strip.to_d * 100).to_i
    )
    render json: @withdrawal
  end

  def payment_sent
    @withdrawal = User::Withdrawal.find(params[:withdrawal_id])
    @withdrawal.update(payment_sent_at: Time.now)
    respond_with(@withdrawal, location: admin_withdrawals_path)
  end
end
