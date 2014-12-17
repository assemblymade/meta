class ProductMetric < ActiveRecord::Base
  belongs_to :product

  # average comment responsiveness of all products
  # uses the latest ProductMetric record
  # associated with each product
  def self.average
    sql = "select avg(product_metrics.comment_responsiveness) as average_comment_responsiveness FROM product_metrics where (product_id, created_at) in (select product_id, max(created_at)  from product_metrics group by product_id) AND comment_responsiveness > 0"
    ActiveRecord::Base.connection.execute(sql).values.flatten.first
  end

  def self.stddev
    sql = "select stddev(product_metrics.comment_responsiveness) as stddev_comment_responsiveness FROM product_metrics where (product_id, created_at) in (select product_id, max(created_at)  from product_metrics group by product_id) AND comment_responsiveness > 0"
    ActiveRecord::Base.connection.execute(sql).values.flatten.first
  end

  def self.minimum
    ProductMetric.where('comment_responsiveness > 0').minimum(:comment_responsiveness)
  end

  def self.maximum
    ProductMetric.maximum(:comment_responsiveness)
  end
end
