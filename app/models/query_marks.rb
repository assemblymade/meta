class QueryMarks

  INHERITED_TAGS_PRODUCTS_TO_WIPS = 0.04
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

  def leading_marks_systemwide(limit)
    Mark.joins(:tasks).where(wips: { closed_at: nil }).group(:name).order('count_all DESC').limit(limit).count
  end

  def mark_vector_for_object(object)  #directly gets markings, don't use for products & wips where inherited marks are also desired
      markings = Marking.where(markable: object)
      markings.map do |m|
        [m.mark_id, m.weight]
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
    Marks::VectorMath.new.add_mark_vectors(vector1, vector2)=
  end

  def dot_product_vectors(vector1, vector2)
    Marks::VectorMath.new.dot_product_vectors(vector1, vector2)
  end

  def subtract_vectors(vector1, vector2)
    vector2 = scale_mark_vector(vector2, -1)
    add_mark_vectors(vector1, vector2)
  end

  def update_markings_to_vector_for_object(object, marking_vector)
    marking_vector.each do |m|
      #check if that marking exists already for object
      if marking = Marking.find_by(mark_id: m[0], markable: object)
        marking.update!({weight: m[1]})
      else
        if m[0]
          Marking.create!({markable: object, mark_id: m[0], weight: m[1]})
        end
      end
    end
  end

  def compare_mark_vectors(object1, object2)
    vector1 = normalized_mark_vector_for_object(object1)
    vector2 = normalized_mark_vector_for_object(object2)
    dot_product_vectors(vector1, vector2)
  end

  def vector_square_distance(vector1,vector2)
    vec1=Hash[vector1]
    vec2=Hash[vector2]
    vec3 = vec1.merge(vec2){
      |_, v1, v2| (v1-v2)
    }.sum{|k,v| v**2 }
  end

  #GENERATE TOP_BOUNTIES, TOP_PRODUCTS

  def wips_on_active_products
    Wip.joins(:product).where(products: {state: ['profitable','greenlit']}).where(closed_at: nil).where(type: "Task").where('wips.created_at > ?', 90.days.ago)
  end

  def compute_task_marks_vector(wips)
    data = wips.joins(:marks).group('wips.id').group('marks.id').pluck("wips.id, marks.id, SUM(markings.weight)")
    data = data.map{|x,y,z| [x, [y,z]]}
    data = data.group_by(&:first)
    task_vector = data.map{ |x, v| [x, v.map{|a,b| [b[0], b[1].to_f] } ] }
  end

  def normalize_wip_vector(merged_vector)
    merged_vector.map{|w, v|
      mag=Math.sqrt(v.sum{|q| q[1]**2})
       [w, v.map{
         |m, am| [m, am/mag]
          }
        ]
    }
  end

  def get_all_wip_vectors
    wips = wips_on_active_products.where.not(product_id: "846ea827-f1d1-48f4-9409-ebae81f868a0")
    task_vector = compute_task_marks_vector(wips)

    products = active_products_not_meta
    product_vector = Hash[construct_product_vector(products)]

    merged_vector = []
    task_vector.each do |w, v|
      r=[w]
      product = Wip.find(w).product
      product_id = product.id
      if product_id && product_vector.keys.include?(product_id)
        pv = Hash[product_vector[product_id]]
        v = Hash[v].merge(pv)
      end
      r.append(v.to_a)
      merged_vector.append(r)
    end
    normalize_wip_vector(merged_vector)
  end

  def active_products_not_meta
    Product.where(state: ['greenlit', 'profitable', 'team_building']).where(flagged_at: nil).where.not(slug: 'meta')
  end

  def construct_product_vector(products)
    product_vector = products.joins(:marks).group('products.id, marks.id').pluck("products.id, marks.id, SUM(markings.weight)").group_by{ |product, mark, weight| product }
    product_vector = product_vector.map{ |p, v| [p, v.map{ |p, m, w| [m, w] }  ]}
  end

  def construct_task_vector(products)
    task_vector = products.joins(tasks: :marks).group('products.id, marks.id').pluck("products.id, marks.id, SUM(markings.weight)*0.2").group_by{|product, mark, weight| product}
    task_vector = task_vector.map{ |p, v| [p, v.map{ |p, m, w| [m, w]}]   }
  end

  def merge_product_task_vectors(task_vector, product_vector)
    merged_vector = Hash[product_vector].merge(Hash[task_vector])
    merged_vector.map{ |k, v|
      magnitude = Math.sqrt(v.sum{ |m, w| w**2})
      [Product.find(k), v.map{|m, w| [m, w/magnitude]}.sort_by { |e| e[1] }.reverse  ]
    }
  end

  def get_all_product_vectors
    products = active_products_not_meta
    product_vector = construct_product_vector(products)

    task_vector = construct_task_vector(products)
    merge_product_task_vectors(task_vector, product_vector)
  end

  def refresh_top_bounties(user, result, limit)
    TopBounty.where(user_id: user.id).delete_all
    n=0
    result.sort_by{|a, b| a}.reverse.take(limit).each do |w|
      n=n+1
      TopBounty.create!({user_id: user.id, score: w[0], rank: n, wip_id: w[1].id})
    end
    result.sort_by{|a,b| a}.reverse
  end

  def assign_top_bounties_for_user(limit, user, wip_vectors)
    user_vector = normalize_mark_vector(user.user_identity.get_mark_vector)
    result = []

    if user_vector.count > 0
      wip_vectors.each do |data|
        vector = data[1]
        wip_id = data[0]
        correlation = dot_product_vectors(user_vector, vector)
        if correlation > 0
          wip = Wip.find(wip_id)
          if wip.user != user
            result.append([correlation.to_f, wip])
          end
        end
      end
      refresh_top_bounties(user, result, limit)
    end
    result.sort_by{|a, b| a}.reverse
  end

  def assign_top_products_for_user(limit, user, product_vectors, user_vector = nil)
    user_vector ||= normalize_mark_vector(user.user_identity.get_mark_vector)
    result = []

    if user_vector.count > 0
      product_vectors.each do |data|
        vector = data[1]
        product = data[0]
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

  def get_date_of_last_marking(object)
    object.markings.sort_by{|hash| hash.updated_at}.reverse.first.updated_at
  end

  def legible_mark_vector(vector)
    r=vector.map{|m, w| mark = Mark.find_by(id: m)
      if mark
        [mark.name, w]
      else
        ['', 0]
      end}
    r.delete(['', 0])
    r
  end

  def get_greatest_users_with_mark(mark_id)
    m = Marking.where(mark_id: mark_id).where(markable_type: "UserIdentity")
    m = m.sort_by{|a| -a.weight}

    m.map{|a|
      s = Marking.where(markable: a.markable).sum(:weight)
      [a.markable.user.username, a.weight/s]
    }
  end

  #RUN DAILY

  def assign_all(limit)
    all_wip_vectors = get_all_wip_vectors
    all_product_vectors = get_all_product_vectors
    total = User.count
    n=1
    User.all.find_each do |user|
      puts "#{n.to_s} / #{total.to_s}  assigning user's top products & bounties -- #{(100*n.to_f/total.to_f).round(2)} -- #{user.username}"
      n=n+1
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

  def product_average
    vector = []
    Product.where(state: ['greenlit', 'profitable', 'team_building']).each do |p|
      vector = add_mark_vectors(vector, p.mark_vector)
    end
    vector = normalize_mark_vector(vector)
  end

  def product_distinctiveness(product, average_vector)
    vector = scale_mark_vector(average_vector, -1.0)
    distinctiveness = add_mark_vectors(vector, normalize_mark_vector(product.mark_vector))
    legible_mark_vector(distinctiveness.sort_by{|a| -a[1]**2})
  end

end
