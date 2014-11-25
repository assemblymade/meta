class UserIdentity < ActiveRecord::Base
  belongs_to :user

  VIEW_WIP_MARKING_WEIGHT = 0.02
  DO_WIP_MARKING_WEIGHT = 1.0
  VIEW_PRODUCT_MARKING_WEIGHT = 0.01

  has_many :markings, as: :markable  #not working for some reason
  has_many :marks, through: :markings  #not working for some reason

  def assign_markings_from_wips
    my_wips = self.user.wips_won
    cumulative_vector = []
    my_wips.each do |w|
      cumulative_vector = QueryMarks.new.add_mark_vectors(w.normalized_mark_vector, cumulative_vector)
    end
    QueryMarks.new.update_markings_to_vector_for_object(self, cumulative_vector)
  end

  def assign_markings_from_viewings
    my_views = Viewing.where(user: self.user)
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

  def find_best_wips(topn)
    top_wips = []
    lowest_wip_score = 0
    lowest_index = -1

    Wip.where(state: 'open').each do |w|
      correlation = QueryMarks.new.compare_mark_vectors(self, w)
      if correlation > lowest_wip_score
        if lowest_index == -1
          top_wips.append(w)
          if top_wips.count >=topn
            lowest_index = top_wips.index(w)
            lowest_wip_score = correlation
          end
        else
          #remove lowest from list
          top_wips.delete_at(lowest_index)
          top_wips.append(w)
          lowest_index = top_wips.index(w)
          lowest_wip_score = correlation
        end
      end
    end
    top_wips
  end

  def find_best_products(topn)   #GREENLIT AND PROFITABLE
    top_products = []
    lowest_product_score = 0
    lowest_index = -1

    Product.where(state: ['greenlit', 'profitable']).each do |p|
      product_vector = QueryMarks.new.normalize_mark_vector(p.mark_vector)
      correlation = QueryMarks.new.dot_product_vectors(product_vector, self.get_mark_vector)
      if correlation > lowest_product_score
        if lowest_index == -1
          top_products.append(p)
          if top_products.count >= topn
            lowest_index = top_products.index(p)
            lowest_product_score = correlation
          end
        end
      end
    end
    top_products
  end



end
