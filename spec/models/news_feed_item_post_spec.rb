require 'spec_helper'

describe NewsFeedItemPost do
  let(:post) { NewsFeedItemPost.make! }

  it 'has url_params' do
    expect(post.url_params).to eq([post.product, post])
  end
end
