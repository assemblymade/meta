class HeartStoriesQuery
  attr_reader :user, :params

  def initialize(user, params)
    @user = user
    @params = params
  end

  def stories
    @stories ||= (nfis + comments).sort_by{|s| -s.hearts.map(&:created_at).max.to_i }
  end

  def hearter_ids
    stories.map{|o| o.hearts.map(&:user_id) }.flatten.uniq
  end

  # private

  def nfis
    @nfis ||= NewsFeedItem.joins(:hearts).
      includes(product: :assets).
      order('max(hearts.created_at) desc').
      group('news_feed_items.id').
      where(source_id: user.id).page(params[:page])
  end

  def comments
    @comments ||= NewsFeedItemComment.joins(:hearts).
      includes(news_feed_item: :hearts).
      order('max(hearts.created_at) desc').
      group('news_feed_item_comments.id').
      where(user_id: user.id).page(params[:page])
  end
end
