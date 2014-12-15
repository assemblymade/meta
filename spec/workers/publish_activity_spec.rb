require 'spec_helper'

describe PublishActivity do
  let(:actor) { User.make! }
  let(:discussion) { Discussion.make!(user: actor) }
  let(:product) { discussion.product }

  it 'creates a story for an activity' do
    activity = Activities::Comment.create!(
      actor: actor,
      subject: discussion.comments.create!(user: actor, body: 'sup'),
      target: discussion
    )

    PublishActivity.new.perform(activity.id, 1234)

    expect(Story.first).to have_attributes(
      verb: 'Comment',
      subject_type: 'Discussion',
    )
  end

  it 'pushes story into user activity stream' do
    activity = Activities::Comment.create!(
      actor: actor,
      subject: discussion.comments.create!(user: actor, body: 'sup'),
      target: discussion
    )

    watcher = User.make!

    discussion.watch!(watcher)

    PublishActivity.new.perform(activity.id, 1234)
    expect(NewsFeed.new(watcher).first.attributes.slice('verb', 'subject_type')).to eq(
      'verb' => 'Comment',
      'subject_type' => 'Discussion',
    )
  end
end
