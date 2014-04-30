class StakeMailer < ActionMailer::Base
  def stake_updated(user_id)
    @user = User.find(user_id)
    @product = Product.find_by!(slug: 'helpful')

    last_product_run = Stake::AllocationRun.where(product: @product).order(:created_at).last
    user_allocation = last_product_run.events.find_by!(user: @user)

    current_period_datapoints =
      Stake::AllocationRun.datapoints_for_period(@product, 0, last_product_run.created_at + 1, Time.now).select{|dp| dp[:winner] == @user }

    @stake                  = "#{"%.02f" % (user_allocation.stake * 100)}"
    @last_month_points      = user_allocation.score
    @current_month_name     = Date.today.strftime("%B")
    @current_month_points   = current_period_datapoints.inject(0){|sum, dp| sum + dp[:score] }
    @total_allocated_points = Stake::AllocationEvent.joins(:allocation_run).where(user: @user, allocation_runs: { product_id: @product.id }).sum(:score)
    @total_points           = @user.karma
    @won_wips               = @user.wips_won.limit(2)

    mail  from: 'Matt (Assembly) <matt@assemblymade.com>',
          to:   @user.email,
          subject: "Hey #{@user.short_name}, its your #{@current_month_name} Assembly stake report"
  end
  
end
