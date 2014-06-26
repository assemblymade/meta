require 'core_ext/time_ext'

class PartnersController < ProductController
  before_action :find_product!

  def index
    @total_cents = 0
    @user_cents = TransactionLogEntry.where(product_id: @product.id).with_cents.group(:user_id).sum(:cents).map do |user_id, cents|
      @total_cents += cents
      [User.find(user_id), cents]
    end.sort_by{|u, c| -c }

    @auto_tips = Hash[AutoTipContract.active_at(@product, Time.now).pluck(:user_id, :amount).map{|user_id, amount| [User.find(user_id), amount] }]
  end

end
