require 'spec_helper'

describe Event do
  let(:wip) { Discussion.make! }
  let(:asterix) { User.make!(username: 'Asterix') }
  let(:zoolander) { User.make!(username: 'Zoolander') }
  let(:comment) { wip.comments.make!(body: 'hello @Asterix and @Zoolander!  Are you Swiss?', user: asterix) }

  describe '#update_pusher' do
    it 'sends updated event to pusher' do
      expect{
        comment.update_pusher
      }.to change(PusherWorker.jobs, :size).by(1)

    end
  end
end
