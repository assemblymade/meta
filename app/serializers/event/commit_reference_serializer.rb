class Event::CommitReferenceSerializer < EventSerializer

  attributes :target_type,
             :target_url,
             :target_title

  def target_type
    'commit'
  end

  def target_url
    object.url
  end

  def target_title
    object.short_hash
  end

end
