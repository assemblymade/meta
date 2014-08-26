class ProductOwnership
  attr_accessor :product, :user_cents, :total_cents

  def initialize(product)
    @product = product
    @total_cents = 0
    @user_cents = calculate_user_cents
  end

  def calculate_user_cents
    users = product.partners.to_a

    @user_cents = entries.inject([]) do |a, (wallet_id, cents)|
      user = users.find{|u| u.id == wallet_id}
      if user
        @total_cents += cents
        a << [user, cents]
      end
      a
    end.sort_by{|u, c| -c }
  end
end
