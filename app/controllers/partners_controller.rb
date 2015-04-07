require 'core_ext/time_ext'

class PartnersController < ProductController
  before_action :find_product!
  before_action :authenticate_user!

  # TODO: (whatupdave) use ProductOwnership
  def index
    @total_cents = 0

    entries = TransactionLogEntry.where(product_id: @product.id).with_cents.group(:wallet_id).sum(:cents)
    users = User.where(id: entries.keys)

    @user_cents = entries.inject([]) do |a, (wallet_id, cents)|
      user = users.find{|u| u.id == wallet_id}
      if user
        @total_cents += cents
        a << [AvatarSerializer.new(user), cents]
      end
      a
    end

    respond_to do |format|
      format.json {
        render json: {
            product: @product.id,
            partners: @user_cents
          }
      }
      format.html
    end
  end

end
