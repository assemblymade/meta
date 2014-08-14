class Event::TitleChangeSerializer < EventSerializer
  attributes :old_title

  def old_title
    Search::Sanitizer.new.sanitize object.body
  end
end
