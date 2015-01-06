require 'spec_helper'

describe WipGroup do
  let(:creator) { User.make!(name: 'whatupdave') }
  let(:products) { [Product.make!(user: creator, name: "Updog"), Product.make!(user: creator, name: "Much Wow")] }
  let(:watchers) { [User.make!, User.make!]}

  let(:tasks) do
    tasks = []
    products.each do |p|
      2.times do
        task = Task.make!(product: p, user: creator)
        NewsFeedItem.create_with_target(task)
        tasks << task
      end
    end
    tasks
  end

  let(:discussions) do
    discussions = []
    products.each do |p|
      2.times do
        discussion = Discussion.make!(product: p, user: creator)
        NewsFeedItem.create_with_target(discussion)
        discussions << discussion
      end
    end
    discussions
  end

  let(:comments) do
    comments = []
    (tasks + discussions).map do |wip|
      2.times do
        comments << NewsFeedItemComment.make!(news_feed_item: wip.news_feed_item, user: creator)
      end
    end
    comments
  end

  it "groups tasks, discussions and comments with products" do
    group = WipGroup.new(tasks + discussions + comments)
    expect(group.products.keys).to match_array(products)

    product = group.products[products.first]
    expect(product.keys).to match_array(tasks.take(2).map(&:news_feed_item) + discussions.take(2).map(&:news_feed_item))

    nfi = group.products[products.first][tasks.first.news_feed_item]
    expect(nfi).to match_array(comments.take(2))
  end

  it "collects watchers" do
    watchers.each {|u| tasks[0].watch!(u) }

    group = WipGroup.new(tasks)

    expect(group.watchers).to match_array(watchers)
  end

  it 'collects product names' do
    expect(
      WipGroup.new(comments).product_names
    ).to match_array(['Updog', 'Much Wow'])
  end
end
