class UnreadMailerPreview < ActionMailer::Preview

  def daily
    UnreadMailer.unread_content(user.id, serialize_articles(random_activity(10)))
  end

  def hourly
    comments = []
    activity = random_activity(10) + comments

    UnreadMailer.unread_content(User.find_by(username: 'whatupdave').id, serialize_articles(activity))
  end

  def hourly_with_mentions
    comments = comments_that_contain(%w(@whatupdave @design @core), 3)
    activity = random_activity(10) + comments

    UnreadMailer.unread_content(User.find_by(username: 'whatupdave').id, serialize_articles(activity))
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
      .take(wip_limit).reject{|o| o.news_feed_item.nil? }


    comments = NewsFeedItemComment.
      order('random()').
      take(comment_limit).reject{|c| c.news_feed_item.nil? }

    wips + comments
  end

  def comments_that_contain(snippets, limit=5)
    clause = snippets.map{ 'body ilike ?' }.join(' or ')
    query = Event::Comment.
      includes(wip: :product).
      where(clause, *snippets.map{|s| "%#{s}%" }).
      order('random()').take(limit)
  end

  def serialize_articles(articles)
    ReadRaptorClient.new.group_with_tags(
      ReadRaptorSerializer.serialize_entities(articles)
    )
  end

end
