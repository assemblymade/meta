module Tags
  class TagBasics

    DEFAULT_TAGGING_WEIGHT = 1.0  #for future use

    def new_tag(new_tag_name)
      Tag.create!({name: new_tag_name})
    end

    def tag_it(object, tag)
      if not Tagging.where(taggable: object, tag_id: tag.id).nil?
        Tagging.create!({taggable: object, tag_id: tag.id, weight: DEFAULT_TAGGING_WEIGHT})
      end
    end

    def find_tag_from_name(name)
      Tag.where(name: name).first
    end

    def tags_on_object(object)
      taggings = Tagging.where(taggable_id: object.id)
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
        Tag.create!({name: t})
      end
    end

    def retroactively_convert_old_wip_taggings_to_new()  #ALL OLD TAGGINGS ARE FOR WIPS
      taggings = Wip::Tagging.all
      taggings.each do |t|
        the_wip = t.wip
        tag_id = t.tag.id
        Tagging.create!({taggable: the_wip, tag_id: tag_id, weight: DEFAULT_TAGGING_WEIGHT})
      end
    end

    def retroactively_convert_old_product_taggings_to_new()
      Product.all.each do |p|
        the_tags = p.tags
        if the_tags.count > 0
          the_tags.each do |t|
            tag = find_tag_from_name(t)
            Tagging.create!({taggable: p, tag_id: tag.id, weight: DEFAULT_TAGGING_WEIGHT})
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
