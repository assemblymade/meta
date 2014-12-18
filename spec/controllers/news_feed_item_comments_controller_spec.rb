require 'spec_helper'

describe NewsFeedItemCommentsController do
  let(:user) { User.make! }
  let(:task) { Task.make! }
  let(:nfi_post) { NewsFeedItemPost.make! }
  let(:task_nfi) { NewsFeedItem.make!(target: task) }
  let(:post_nfi) { nfi_post.news_feed_item }
  let(:product) { task.product }

end
