class Admin::UserBooksController < AdminController

  def index
    @paid_users = User.joins(:withdrawals).sort_by(&:total_earned).reverse

  end
end
