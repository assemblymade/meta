module StoresHelper
  STORES = {
    activity_stream: 'chat_rooms/chat_messages_store',
    bounties: 'wips/bounties_store',
    default_users: 'chat_rooms/people_store',
    post: 'news_feed_items/archived_news_feed_items_store',
    heartables: 'news_feed_items/heartables_store',
    news_feed_item: 'news_feed_items/heartables_store',
    news_feed_items: 'news_feed_items/news_feed_items_store',
    posts: 'posts/posts_store',
    pagination_store: 'shared/pagination_store',
    product: ['products/product_followers_store', 'products/product_store'],
    product_assets: 'bounties/comment_attachment_store',
    products: 'products/products_store',
    signup_form_store: 'users/signup_form_store',
    user_subscriptions: 'users/user_subscriptions',
    wip: 'wips/people_store',
  }

  def hydrate_stores
    if signed_in?
      concat render partial: 'users/user_store'
    end

    (@stores || []).each do |k,v|
      next if STORES[k].nil?
      Array(STORES[k]).each do |key|
        concat render partial: key
      end
    end
  end

  def store_data(key)
    @stores[key]
  end
end
