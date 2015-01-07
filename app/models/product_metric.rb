class ProductMetric < ActiveRecord::Base
  belongs_to :product

  serialize :response_times


  # Metrics methods
  def self.trailing_range_activity(product:, time: Time.now, range: 30.days)
    Activity.where(product: product)
            .where('created_at >= ?', time-range)
            .where('created_at < ?', time)
            .count
  end

  def self.response_times(product:, time: Time.now)

    response_times = { "core" => [], "noncore" => [], "comments_count" => 0 }

    # need to join on NFIs since comments are now attached to those
    tasks_with_comments = product.tasks
                                 .joins(:news_feed_items)
                                 .where('news_feed_items.comments_count > 0')
                                 .where('news_feed_items.updated_at <= ?', time)

    if (ppms = ProductMetric.where(product: product).where('updated_at <= ?', time).order(created_at: :desc)).exists?
      tasks_with_comments = tasks_with_comments.where('news_feed_items.updated_at > ?', ppms.first.created_at)
    end

    unless tasks_with_comments.blank?

      tasks_with_comments.each do |t|
        # ordered from least to most recent
        comments = t.news_feed_item.comments.order(created_at: :asc).where('created_at <= ?', time)

        if ppms.exists?
          comments = comments.where('created_at > ?', ppms.first.created_at)
        end

        response_times["comments_count"] = comments.count
        next if comments.count == 0

        # add penalty to core for unanswered comments
        # unless bounty is closed or last comment was from core
        unless ["awarded", "closed", "resolved"].include?(t.state) || product.core_team.include?(comments.last.user)
          response_times["core"] << (Time.now - comments.maximum(:created_at)).abs
        end

        if (product.core_team.include?(t.user) && !product.core_team.include?(comments.first.user))
          response_times["noncore"] << comments.first.created_at - t.created_at
        elsif (!product.core_team.include?(t.user) && product.core_team.include?(comments.first.user))
          response_times["core"] << comments.first.created_at - t.created_at
        end

        next if comments.count == 1

        comments.each do |c|
          # time from comment to most recent previous comment
          previous = t.news_feed_item.comments
                                     .where('created_at < ?', c.created_at)
                                     .where.not(id: c.id)
                                     .reorder(created_at: :desc)
                                     .limit(1)
                                     .first

          # unless no previous comment or current and previous comment are both made by core user
          unless previous.nil? || (product.core_team.include?(c.user) && product.core_team.include?(previous.user))

            # current comment made by core and previous is made by noncore
            if product.core_team.include?(c.user) && !product.core_team.include?(previous.user)
              times = response_times["core"]
            else
              times = response_times["noncore"]
            end

            time_diff = c.created_at - previous.created_at
            times << time_diff unless time_diff <= 0
          end
        end
      end
    end
    response_times.merge!(ppms.first.response_times){|k, x, y| x + y} if ppms.exists? && !ppms.first.response_times.nil?
    response_times
  end

  def self.record_new(product:, time: Time.now)
    response_times = response_times(product: product)
    activity = trailing_range_activity(product: product, range: 30.days)

    create(
      product: product,
      comments_count: response_times.delete("comments_count"){0},
      noncore_responsiveness: response_times["noncore"].empty? ? -1 : response_times["noncore"].sum / response_times["noncore"].length,
      core_responsiveness: response_times["core"].empty? ? -1 : response_times["core"].sum / response_times["core"].length,
      response_times: response_times,
      trailing_month_activity: activity,
      created_at: time
      )
  end

  # Math methods

  # note that queries exclude products that have no comments

  # weighted arithmetic mean comment responsiveness of all products
  # uses the most recent ProductMetric record
  # associated with each product
  def self.overflow_safe_weighted_average(attr_name)
    raise "that attribute name is invalid!" unless valid_numerical_attribute_type?(attr_name)

    records = all_most_recent(attr_name).where('comments_count > 0')
    denom = records.sum(:comments_count)

    records.map{|x| x.public_send(attr_name).to_i * x.public_send(:comments_count).to_f / denom}.sum.to_i
  end

  def self.calc_stddev(attr_name)
    raise "that attribute name is invalid!" unless valid_numerical_attribute_type?(attr_name)
    sql = "select stddev(product_metrics.#{attr_name}) as stddev_#{attr_name} FROM product_metrics where (product_id, created_at) in (select product_id, max(created_at) from product_metrics group by product_id) AND #{attr_name} > 0"
    ActiveRecord::Base.connection.execute(sql).values.flatten.first.try(:to_i)
  end

  def self.calc_minimum(attr_name)
    raise "that attribute name is invalid!" unless valid_numerical_attribute_type?(attr_name)
    where("#{attr_name} > 0").minimum(attr_name)
  end

  def self.median(attr_name)
    raise "that attribute name is invalid!" unless valid_numerical_attribute_type?(attr_name)
    r = all_most_recent(attr_name).order(attr_name => :asc)
    total = r.count
    return "error" if total < 1
    return r.first if total == 1

    midpoint = total / 2

    total % 2 == 0 ? (r.offset(midpoint-1).limit(2).pluck(attr_name).sum / 2.0) : r.offset(midpoint-1).limit(1).first.read_attribute(attr_name)
  end

  # only returns records where attr_name is positive
  def self.all_most_recent(attr_name=nil)
    raise "that attribute name is invalid!" unless valid_numerical_attribute_type?(attr_name)
    clause = "(product_id, created_at) in (select product_id, max(created_at) from product_metrics group by product_id)"
    query = where(clause)
    attr_name.present? ? query.where("#{attr_name} > 0") : query
  end

  private

    def self.get_attribute_type(attr_name)
      columns_hash[attr_name.to_s].try(:type)
    end

    def self.valid_numerical_attribute_type?(attr_name)
      [:float, :integer].include? get_attribute_type(attr_name)
    end

end
