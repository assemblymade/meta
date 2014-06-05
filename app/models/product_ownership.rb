class ProductOwnership
  attr_accessor :product, :user_cents, :total_cents

  def initialize(product)
    @product = product
    @total_cents = 0
    @user_cents = calculate_user_cents
  end

  def calculate_user_cents
    TransactionLogEntry.where(product_id: product.id).with_cents.group(:user_id).sum(:cents).map do |user_id, cents|
      @total_cents += cents
      [User.find(user_id), cents]
    end.sort_by{|u, c| -c }
  end
end
