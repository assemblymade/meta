require 'spec_helper'

describe Event do
  let(:wip) { Discussion.make! }
  let(:asterix) { User.make!(username: 'Asterix') }
  let(:zoolander) { User.make!(username: 'Zoolander') }
  let(:comment) { wip.comments.make!(body: 'hello @Asterix and @Zoolander!', user: asterix) }

  describe '#deliver_notifications!' do
    it 'notifies mentioned users but not the issuing user' do
      expect(comment).to receive(:notify_by_email).with(zoolander)
      expect(comment).not_to receive(:notify_by_email).with(asterix)

      comment.deliver_notifications!([])
    end
  end
end
