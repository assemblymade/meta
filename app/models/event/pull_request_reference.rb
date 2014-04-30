class Event::PullRequestReference < Event
  validates :url,  presence: true
  validates :body, presence: true

  def pull_request
    url.split('/').last
  end

  def awardable?
    true
  end
end