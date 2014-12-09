class Admin::UserBooksController < AdminController

  def index
    @paid_users = User.joins(:withdrawals).uniq.sort_by(&:total_earned).reverse

  end
end
