class ProductMetric < ActiveRecord::Base
  belongs_to :product

  # note that queries exclude products that have no comments

  # weighted arithmetic mean comment responsiveness of all products
  # uses the most recent ProductMetric record
  # associated with each product
  def self.mean_comment_responsiveness
    sql = "select sum(product_metrics.comment_responsiveness * product_metrics.comments_count) / sum(product_metrics.comments_count) as average_comment_responsiveness FROM product_metrics where (product_id, created_at) in (select product_id, max(created_at)  from product_metrics group by product_id) AND comment_responsiveness > 0 AND comments_count > 0"
    ActiveRecord::Base.connection.execute(sql).values.flatten.first.try(:to_f)
  end

  def self.overflow_safe_mean_comment_responsiveness
    sql = "select product_metrics.* FROM product_metrics where (product_id, created_at) in (select product_id, max(created_at)  from product_metrics group by product_id) AND comment_responsiveness > 0 AND comments_count > 0"
    results = ActiveRecord::Base.connection.exec_query(sql).to_hash
    numerators = []
    denominators = []

    results.each do |r|
      numerators << r["comment_responsiveness"].to_f * r["comments_count"].to_f
    end

    denom = results.map{|x| x["comments_count"].to_f}.sum
    results.map{|x| x["comment_responsiveness"].to_f * x["comments_count"].to_f / denom}.sum
  end

  def self.stddev_comment_responsiveness
    sql = "select stddev(product_metrics.comment_responsiveness) as stddev_comment_responsiveness FROM product_metrics where (product_id, created_at) in (select product_id, max(created_at)  from product_metrics group by product_id) AND comment_responsiveness > 0"
    ActiveRecord::Base.connection.execute(sql).values.flatten.first.try(:to_f)
  end

  def self.minimum_comment_responsiveness
    ProductMetric.where('comment_responsiveness > 0').minimum(:comment_responsiveness)
  end

  def self.maximum_comment_responsiveness
    ProductMetric.maximum(:comment_responsiveness)
  end

  def self.all_most_recent_comment_responsiveness
    sql = "select * FROM product_metrics where (product_id, created_at) in (select product_id, max(created_at)  from product_metrics group by product_id) AND comment_responsiveness > 0"
    ActiveRecord::Base.connection.exec_query(sql).to_hash
  end

  def self.median_comment_responsiveness
    r = self.all_most_recent_comment_responsiveness
    return "error" if r.length < 1
    return r.first if r.length == 1
    midpoint = r.length / 2
    r.length % 2 == 0 ? (r[midpoint]["comment_responsiveness"].to_f + r[midpoint-1]["comment_responsiveness"].to_i) / 2 : r[midpoint]["comment_responsiveness"].to_f
  end

end
