class HeartCommentSerializer < HeartNFISerializer
  attributes :nfi

  cached

  def cache_key
    [object]
  end

  def nfi
    HeartNFISerializer.new(object.news_feed_item)
  end

end
