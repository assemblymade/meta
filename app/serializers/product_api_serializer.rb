class ProductApiSerializer < ActiveModel::Serializer
  attributes :partners

  def partners
    TransactionLogEntry.product_partners_with_balances(object.id).sort_by{|a, b| -b}.map{ |a, b| {user: UserApiSerializer.new(User.find(a)), coins: b} }
  end
end
