class Event::CommitReference < Event
  validates :url,  presence: true
  validates :body, presence: true

  def short_hash
    hash[0..7]
  end

  def hash
    url =~ /github.com.*commit\/([a-f0-9]+)/
    $1
  end

  def awardable?
    true
  end
end