module Marks
  class MarkBasics

    DEFAULT_MARKING_WEIGHT = 1.0  #for future use

    def new_mark(new_mark_name)
      Mark.create!({name: new_mark_name})
    end

    def mark_it(object, mark)
      if not Marking.where(markable_id: object.id).where(mark_id: mark.id).present?
        Marking.create!({markable: object, mark_id: mark.id, weight: DEFAULT_MARKING_WEIGHT})
      end
    end

    def mark_with_name(object, mark_name)
      themark = Mark.find_by(name: mark_name)
      if themark.nil?
        newmark = new_mark(mark_name)
        mark_it(object, newmark)
      else
        mark_it(object, themark)
      end
    end

    def find_mark_from_name(name)
      the_mark = Mark.where(name: name)
      if the_mark.present?
        return the_mark.first  #There should only ever be one mark per name
      end
    end

    def wips_with_mark(mark_name)
      Wip.joins(:marks).where('marks.name = ?', mark_name)
    end

    def wips_with_mark_under_product(mark_name, product)
      Wip.joins(:marks).where('marks.name = ?', mark_name).where(product_id: product.id)
    end

    def products_with_mark(mark_name)
      Product.joins(:marks).where('marks.name = ?', mark_name)
    end

    def leading_marks_on_product(product, limit)
      Mark.joins(:tasks).where(wips: { closed_at: nil }).where(wips: { product_id: product.id }).group(:name).order('count_all DESC').limit(limit).count
    end


    def news_feed_items_per_product_per_mark(product, mark_name)
      product.news_feed_items.select do |news_feed_item|
        news_feed_item.target && news_feed_item.target.has_attribute?('marks') &&
          news_feed_item.target.marks.includes?(mark_name)
      end
    end

    def leading_marks_systemwide(limit)
      Mark.joins(:tasks).where(wips: { closed_at: nil }).group(:name).order('count_all DESC').limit(limit).count
    end

    #RUN ONCE
    def retroactively_convert_old_tags_to_new()
      tag_names = Wip::Tag.all.pluck(:name)
      unique_tag_sets = Product.all.uniq.pluck(:tags)
      unique_tag_sets.each do |u|
        tag_names = tag_names + u
      end
      tag_names.uniq!
      tag_names.each do |t|
        if Mark.find_by(name: t).nil?
          Mark.create!({name: t})
        end
      end
    end

    def retroactively_convert_old_wip_taggings_to_new()  #ALL OLD markingS ARE FOR WIPS
      taggings = Wip::Tagging.all
      taggings.each do |t|
        the_wip = t.wip
        name = t.tag.name
        mark_id = Mark.find_by(name: name).id
        if not Marking.where(mark_id: mark_id).where(markable_id: the_wip.id).present?
          Marking.create!({markable: the_wip, mark_id: mark_id, weight: DEFAULT_MARKING_WEIGHT})
        end
      end
    end

    def retroactively_convert_old_product_taggings_to_new()
      Product.all.each do |p|
        the_tags = p.tags
        if the_tags.count > 0
          the_tags.each do |t|
            the_mark = find_mark_from_name(t)
            if not the_mark.nil?
              if not Marking.where(mark_id: the_mark.id).where(markable_id: p.id).present?
                Marking.create!({markable: p, mark_id: the_mark.id, weight: DEFAULT_MARKING_WEIGHT})
              end
            end
          end
        end
      end
    end

    def retroactively_convert_old_system()
      retroactively_convert_old_tags_to_new()
      retroactively_convert_old_wip_taggings_to_new
      retroactively_convert_old_product_taggings_to_new()
    end


  end
end
