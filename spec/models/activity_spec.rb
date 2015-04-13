require 'spec_helper'

describe Activity do
  let(:actor) { User.make! }
  let(:subject) { Task.make! }
  let(:target) { subject.product }
  let(:chat_message) { Event::Comment.make!(user: actor, body: 'boo boo boo') }
  let(:chat_room) { ChatRoom.make! }

  it 'tracks after create' do
    expect {
      activity = Activity.create!(actor: actor, subject: subject, target: target)
      activity.run_callbacks(:commit)
    }.to change(TrackActivityCreated.jobs, :size).by(1)
  end

  context 'Landline migration' do
    before do
      Activity.any_instance.stub(:publishable).and_return(true)
    end

    it 'pushes to Landline if a bridge opt is absent' do
      expect {
        Activity.publish!(actor: actor, subject: chat_message, target: chat_room)
      }.to change(LandlineBridgeWorker.jobs, :size).by(1)
    end

    it 'does not push to Landline if a bridge opt is present' do
      expect {
        Activity.publish!(actor: actor, subject: chat_message, target: chat_room, bridge: true)
      }.to change(LandlineBridgeWorker.jobs, :size).by(0)
    end
  end
end
