class PromotedProductsQuery
  def self.call
    most_recently_promoted_products
  end

  def self.most_recently_promoted_products
    promoted_products.select("products.*, promoted_products.promoted_at").
      limit(3).order("promoted_products.promoted_at DESC")
  end

  def self.promoted_products
    Product.where(can_advertise: true).where(flagged_at: nil).
      joins("INNER JOIN #{promoted_wips_grouped_by_product_query} ON products.id = promoted_products.product_id")
  end

  def self.promoted_wips_grouped_by_product_query
    Wip.promoted.available.
      select("product_id, MAX(promoted_at) AS promoted_at").
      group("product_id").as("promoted_products").to_sql
  end
end
