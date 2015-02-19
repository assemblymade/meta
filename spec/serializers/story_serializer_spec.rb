require 'spec_helper'

describe Story do
  let(:discussion) { Discussion.make! }
  let(:user) { User.make! }

  describe 'body_preview' do
    it 'pulls body from comment' do
      comment = NewsFeedItemComment.make!(user: user, body: 'The issue is change. Change for the future. The people have spoken.')

      story = Story.create!(verb: 'Comment', subject_type: 'Discussion')
      activity = Activities::Comment.create(actor: user, subject: comment, target: discussion, story: story)

      expect(StorySerializer.new(story).body_preview).to eq(
        'The issue is change. Change for the future. The people have spoken.'
      )
    end
  end
end
