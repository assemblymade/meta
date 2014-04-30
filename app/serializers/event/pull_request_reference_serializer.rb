class Event::PullRequestReferenceSerializer < EventSerializer

  attributes :target_type, :target_url, :target_title

  def target_type
    'pull request'
  end

  def target_url
    object.url
  end

  def target_title
    object.body.split("\n").first
  end

end
