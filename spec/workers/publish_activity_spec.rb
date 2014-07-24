require 'spec_helper'

describe PublishActivity do
  let(:actor) { User.make! }
  let(:discussion) { Discussion.make!(user: actor) }
  let(:product) { discussion.product }

  it 'creates a story for an activity' do
    activity = Activities::Start.create!(
      actor: actor,
      subject: discussion,
      target: product
    )

    PublishActivity.new.perform(activity.id)

    expect(Story.first).to have_attributes(
      verb: 'Start',
      subject_type: 'Discussion',
    )
  end

  it 'pushes story into user activity stream' do
    activity = Activities::Start.create!(
      actor: actor,
      subject: discussion,
      target: product
    )

    watcher = User.make!

    product.watchings.create!(subscription: true, user: watcher)

    PublishActivity.new.perform(activity.id)
    expect(NewsFeed.new(watcher).first).to have_attributes(
      verb: 'Start',
      subject_type: 'Discussion',
    )
  end
end