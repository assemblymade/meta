class PartnerSerializer < ActiveModel::Serializer
  attributes :assets

  def assets
    TransactionLogEntry.product_balances(object).map{|a, b| construct_product_item(a, b) }
  end

  def construct_product_item(product_id, coins)
    {product: ProductShallowSerializer.new(Product.find(product_id)), coins: coins}
  end
end
