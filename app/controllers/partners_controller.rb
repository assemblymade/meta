require 'core_ext/time_ext'

class PartnersController < ProductController
  before_action :find_product!

  # TODO: (whatupdave) use ProductOwnership
  def index
    @total_cents = 0

    entries = TransactionLogEntry.where(product_id: @product.id).with_cents.group(:wallet_id).sum(:cents)
    users = User.where(id: entries.keys).to_a

    @user_cents = entries.inject([]) do |a, (wallet_id, cents)|
      user = users.find{|u| u.id == wallet_id}
      if user
        @total_cents += cents
        a << [user, cents]
      end
      a
    end.sort_by{|u, c| -c }

    @auto_tips = Hash[AutoTipContract.active_at(@product, Time.now).pluck(:user_id, :amount).map{|user_id, amount| [User.find(user_id), amount] }]


  


  end

end
