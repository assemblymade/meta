class QueryMarks

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
end
