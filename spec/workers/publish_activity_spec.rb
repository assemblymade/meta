require 'spec_helper'

describe PublishActivity do
  let(:actor) { User.make! }
  let(:nfi) { NewsFeedItem.make! }
  let(:task) { Task.make!(user: actor, news_feed_item: nfi) }
  let(:product) { task.product }

  it 'creates a story for an activity' do
    activity = Activities::Comment.create!(
      actor: actor,
      subject: NewsFeedItemComment.make!(user: actor),
      target: task
    )

    PublishActivity.new.perform(activity.id, 1234)

    expect(Story.first).to have_attributes(
      verb: 'Comment',
      subject_type: 'Task',
    )
  end

  it 'pushes story into user activity stream' do
    activity = Activities::Comment.create!(
      actor: actor,
      subject: NewsFeedItemComment.make!(news_feed_item: nfi, user: actor, body: 'sup'),
      target: task
    )

    watcher = User.make!

    nfi.followers << watcher

    PublishActivity.new.perform(activity.id, 1234)

    expect(NewsFeed.new(watcher).first.attributes.slice('verb', 'subject_type')).to eq(
      'verb' => 'Comment',
      'subject_type' => 'Task',
    )
  end
end
