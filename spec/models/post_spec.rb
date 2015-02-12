require 'spec_helper'

describe 'Post' do
  let(:product) { Product.make! }
  let(:author) { User.make! }
  let(:post) { Post.make!(author: author, product: product) }
  let(:nfi) { NewsFeedItem.make!(target: post, source: author) }

  describe '#update_news_feed_item' do
    it 'calls #update_news_feed_item after_commit' do
      Post.any_instance.stub(:update_news_feed_item)
      expect(post).to receive(:update_news_feed_item)

      post.update(title: 'A History of the World')
    end
  end

  describe '#mark_names' do
    let(:core) { User.make! }

    before do
      product.core_team << core
    end

    it 'does not allow #announcement unless user is core' do
      expect {
        Post.make!(author: author, product: product, mark_names: ['announcement'])
      }.to raise_error
    end

    it 'automatically marks #announcement if user is core' do
      post = Post.make!(author: core, product: product)

      expect(post.mark_names).to include('announcement')
    end
  end
end
