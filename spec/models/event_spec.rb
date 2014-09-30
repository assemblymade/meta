require 'spec_helper'

describe Event do
  let(:wip) { Discussion.make! }
  let(:asterix) { User.make!(username: 'Asterix') }
  let(:zoolander) { User.make!(username: 'Zoolander') }
  let(:comment) { wip.comments.make!(body: 'hello @Asterix and @Zoolander!', user: asterix) }

  describe '#notify_users!' do
    it 'notifies mentioned users but not the issuing user' do
      expect(comment).to receive(:notify_by_email).with(zoolander)
      expect(comment).not_to receive(:notify_by_email).with(asterix)

      comment.notify_users!([])
    end
  end
end
