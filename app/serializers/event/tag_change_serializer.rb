class Event::TagChangeSerializer < EventSerializer
  attributes :removed, :added

  def removed
    serialize_tag_names(object.from - object.to)
  end

  def added
    serialize_tag_names(object.to - object.from)
  end

  def serialize_tag_names(names)
    tags = names.map{ |name| Wip::Tag.new(name: name) }
    {
      tags: tags.map{|t| WipTagSerializer.new(t) }
    } if tags.any?
  end
end