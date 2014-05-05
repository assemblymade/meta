class DigestMailerPreview < ActionMailer::Preview

  def daily
    Showcase.delete_all
    DigestMailer.daily(user.id, serialize_articles(random_activity(10)))
  end

  def daily_with_showcase
    DigestMailer.daily(user.id, serialize_articles(random_activity(10)))
  end

  def weekly
    newsletter = create_newsletter!
    DigestMailer.weekly(user.id, newsletter.id)
  end

  private

  def user
    User.sample
  end

  def create_newsletter!
    Newsletter.create!(
      subject: 'Testing broadcast',
      body:    'This is a test broadcast. It can also contain **markdown**. Get it [here](http://google.com)'
    )
  end

  def random_activity(n)
    wip_limit = rand(n)
    comment_limit = n - wip_limit

    wips = Wip
      .order('random()')
      .take(wip_limit)

    comments = Event::Comment
      .joins(:wip)
      .order('random()')
      .take(comment_limit)

    wips + comments
  end

  def serialize_articles(articles)
    ReadRaptorSerializer.serialize_entities(articles)
  end

end
