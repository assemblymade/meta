class QueryMarks

  INHERITED_TAGS_PRODUCTS_TO_WIPS = 0.2
  INHERITED_TAGS_WIPS_TO_PRODUCTS = 0.2

  def find_mark_from_name(name)
    the_mark = Mark.where(name: name)
    if the_mark.present?
      return the_mark.first  #There should only ever be one mark per name
    end
  end

  def wips_with_mark_under_product(mark_name, product)
    Wip.joins(:marks).where('marks.name = ?', mark_name).where(product_id: product.id)
  end

  def leading_marks_on_product(product, limit)
    Mark.joins(:tasks).where(wips: { closed_at: nil }).where(wips: { product_id: product.id }).group(:name).order('count_all DESC').limit(limit).count
  end

  def news_feed_items_per_product_per_mark(product, mark_name)
    product.news_feed_items.select do |news_feed_item|
      if news_feed_item.target
        if news_feed_item.target.class.name == "Task" or news_feed_item.target.class.name == "Wip"
          news_feed_item.target.marks.where(name: mark_name).count > 0
        end
      end
    end
  end

  def leading_marks_systemwide(limit)
    Mark.joins(:tasks).where(wips: { closed_at: nil }).group(:name).order('count_all DESC').limit(limit).count
  end


  def mark_vector_for_object(object)  #directly gets markings, don't use for products & wips where inherited marks are also desired
      markings = Marking.where(markable: object)
      markings.map do |m|
        [m.mark, m.weight]
      end
  end

  def scale_mark_vector(vector, scalar)
    vector.map{ |mark, weight| [mark, weight * scalar] }
  end

  def normalize_mark_vector(vector)
    magnitude = vector.sum{ |_, weight| weight ** 2}
    magnitude = Math.sqrt([0.000001, magnitude].max)
    normalized_vector = vector.map{ |mark, weight| [mark, weight / magnitude] }
    normalized_vector.sort_by{ |_, weight| weight}.reverse
  end

  def normalized_mark_vector_for_object(object)

    if object.class.to_s == "Task" || object.class.to_s == "Product"
      object.normalized_mark_vector()
    else
      vector = mark_vector_for_object(object)
      normalize_mark_vector(vector)
    end
  end

  def add_mark_vectors(vector1, vector2)
    #add vectors and save markings accordingly
    mark_types1 = vector1.map{ |a| a[0] }
    mark_values1 = vector1.map{|a| a[1]}
    mark_values2 = vector2.map{|a| a[1]}
    mark_types2 = vector2.map{|a| a[0] }
    overlapped_types = mark_types1 & mark_types2
    nonoverlapped_types1 = (mark_types1 - mark_types2)
    nonoverlapped_types2 = (mark_types2 - mark_types1)
    sum_vector = []
    overlapped_types.each do |a|
      newsum = mark_values1[mark_types1.index(a)] + mark_values2[mark_types2.index(a)]
      sum_vector.append([a, newsum])
    end

    nonoverlapped_types1.each do |a|
      sum_vector.append([ a, mark_values1[mark_types1.index(a)]])
    end

    nonoverlapped_types2.each do |a|
      sum_vector.append([ a, mark_values2[mark_types2.index(a)]])
    end
    sum_vector
  end

  def dot_product_vectors(vector1, vector2)
    if vector1.count == 0 or vector2.count == 0
      dot_product = 0
    else
      dot_product = 0

      mark_types1 = vector1.map{ |a| a[0] }
      mark_values1 = vector1.map{|a| a[1]}
      mark_values2 = vector2.map{|a| a[1]}
      mark_types2 = vector2.map{|a| a[0] }
      overlapped_types = mark_types1 & mark_types2

      overlapped_types.each do |a|
        dot_product = dot_product + mark_values1[mark_types1.index(a)] * mark_values2[mark_types2.index(a)]
      end
    end
    dot_product
  end

  def update_markings_to_vector_for_object(object, marking_vector)
    marking_vector.each do |m|
      #check if that marking exists already for object
      if marking = Marking.find_by(mark: m[0], markable: object)
        marking.update!({weight: m[1]})
      else
        Marking.create!({markable: object, mark_id: m[0].id, weight: m[1]})
      end
    end
  end

  def compare_mark_vectors(object1, object2)
    vector1 = normalized_mark_vector_for_object(object1)
    vector2 = normalized_mark_vector_for_object(object2)
    dot_product_vectors(vector1, vector2)
  end

  #GENERATE TOP_BOUNTIES, TOP_PRODUCTS

  def get_all_wip_vectors
    wips = Wip.where(state: 'open').where(type: "Task")
    wip_vectors = wips.map{|w| [normalize_mark_vector(w.mark_vector), w] }
    wip_vectors.select{ |a, b| a.count > 0}
  end

  def get_all_product_vectors
    products = Product.where(state: ['greenlit', 'profitable'])
    product_vectors = products.map{ |p| [ normalize_mark_vector(p.mark_vector) , p] }
    product_vectors.select{ |a, b| a.count >0 }
  end

  def assign_top_bounties_for_user(limit, user, wip_vectors)
    user_vector = normalize_mark_vector(user.user_identity.get_mark_vector)
    result = []

    if user_vector.count > 0
      wip_vectors.each do |data|
        vector = data[0]
        wip = data[1]
        correlation = dot_product_vectors(user_vector, vector)
        if correlation > 0
          result.append([correlation.to_f, wip])
        end
      end

      TopBounty.where(user_id: user.id).delete_all
      n=0
      result.sort_by{|a, b| a}.reverse.take(limit).each do |w|
        n=n+1
        TopBounty.create!({user_id: user.id, score: w[0], rank: n, wip_id: w[1].id})
      end
      result.sort_by{|a,b| a}.reverse
    end
    result.sort_by{|a, b| a}.reverse
  end


  def assign_top_products_for_user(limit, user, product_vectors)
    user_vector = normalize_mark_vector(user.user_identity.get_mark_vector)
    result = []

    if user_vector.count > 0
      product_vectors.each do |data|
        vector = data[0]
        product = data[1]
        correlation = dot_product_vectors(user_vector, vector)
        result.append([correlation, product])
      end

      TopProduct.where(user_id: user.id).delete_all
      n=0
      result.sort_by{|a, b| a}.reverse.take(limit).each do |w|
        n=n+1
        TopProduct.create!({user_id: user.id, score: w[0], rank: n, product_id: w[1].id})
      end
      result.sort_by{|a,b| a}.reverse
    end
    result.sort_by{|a,b| a}.reverse
  end

  #RUN DAILY

  def assign_all(limit)
    all_wip_vectors = get_all_wip_vectors
    all_product_vectors = get_all_product_vectors
    User.all.find_each do |user|
      assign_top_bounties_for_user(limit, user, all_wip_vectors)
      assign_top_products_for_user(limit, user, all_product_vectors)
    end
  end

  #RUN ONCE
  def retroactively_generate_all_user_markings
    User.all.each do |a|
      a.user_identity.markings.delete_all
      a.user_identity.assign_markings_from_scratch
    end
  end


end
