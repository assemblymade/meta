require 'spec_helper'

describe Activity do
  let(:actor) { User.make! }
  let(:subject) { Event::Comment.make! }
  let(:target) { Task.make! }

  it 'tracks after create' do
    expect {
      activity = Activity.create!(actor: actor, subject: subject, target: target)
      activity.run_callbacks(:commit)
    }.to change(TrackActivityCreated.jobs, :size).by(1)
  end
end
