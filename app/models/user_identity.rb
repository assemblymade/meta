class UserIdentity < ActiveRecord::Base
  belongs_to :user

  VIEW_WIP_MARKING_WEIGHT = 0.02
  DO_WIP_MARKING_WEIGHT = 1.0
  VIEW_PRODUCT_MARKING_WEIGHT = 0.01

  has_many :markings, as: :markable
  has_many :marks, through: :markings

  def assign_markings_from_wips
    my_wips = self.user.wips_won
    cumulative_vector = []
    my_wips.each do |w|
      cumulative_vector = QueryMarks.new.add_mark_vectors(w.normalized_mark_vector, cumulative_vector)
    end
    QueryMarks.new.update_markings_to_vector_for_object(self, cumulative_vector)
  end

  def assign_markings_from_viewings
    my_views = self.user.viewings
    my_views.each do |v|
      #get mark set of viewable
      mark_vector = QueryMarks.new.mark_vector_for_object(v.viewable)

      #scale according to significance of product view/ bounty view/ etc
      mark_vector = QueryMarks.new.scale_mark_vector(mark_vector, VIEW_PRODUCT_MARKING_WEIGHT)

      #add pre-existing mark vector to new mark vector
      old_mark_vector = QueryMarks.new.mark_vector_for_object(self)
      new_mark_vector = QueryMarks.new.add_mark_vectors(old_mark_vector, mark_vector)

      #update identity markings with new mark vector
      QueryMarks.new.update_markings_to_vector_for_object(self, new_mark_vector)
    end
  end

  def assign_markings_from_scratch
    assign_markings_from_wips
    assign_markings_from_viewings
  end

  def get_mark_vector()
    QueryMarks.new.normalized_mark_vector_for_object(self).sort{|a,b| b[1] <=> a[1]}
  end

  def find_best_wips(limit, wips)
    wips_with_score = wips.map{|w| [w, QueryMarks.new.compare_mark_vectors(self, w)]}
    wips_with_score.sort_by{|w, s| s}.reverse.take(limit)
    wips_with_score.map{|w, s| [w, w.product, s]}.sort_by{|w, p, s| s}.reverse.take(limit)
  end

  def find_best_products(limit)   #GREENLIT AND PROFITABLE
    products_with_score = Product.where(state: ['greenlit', 'profitable']).map{|p| [p, QueryMarks.new.compare_mark_vectors(self, p)] }
    products_with_score.sort_by{|p, s| s}.reverse.take(limit)
  end

  def find_best_wips_among_best_products(limit_wips, limit_products)
    best_products = find_best_products(limit_products)
    best_found_wips = []
    best_products.each do |bp|
      best_found_wips = best_found_wips + find_best_wips(limit_wips, bp[0].wips.where(state: 'open'))
    end

    best_found_wips = best_found_wips.sort_by{|w, s| s}.reverse.take(limit_wips)
    best_found_wips.map{|w, p, s| [w.title, p, s] }
  end
end
