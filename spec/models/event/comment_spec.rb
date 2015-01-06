require 'spec_helper'

describe Event::Comment do
  let(:wip) { Discussion.make! }
  let(:admin) { User.make! }
  let(:flagged_user) { User.make!(flagged_at: Time.now) }
  subject { wip.comments.make! body: 'hello foo!' }

  describe 'history' do
    before {
      subject.update body: 'hello bar!', updated_by: admin
    }

    its(:version) { should == 2 }

    it 'has previous version' do
      subject.versions.last.modifications.should == 'hello foo!'
    end
  end

  it 'checks in the user when they comment on a task they they are a worker of so we dont remind them about working on it' do
    comment = Event::Comment.make(wip: task = Task.make!, user: user = User.make!)
    task.start_work!(user)

    task.wip_workers.first.last_response_at.should be_nil
    comment.save!
    task.wip_workers.first.last_response_at.should_not be_nil
  end

  it 'notifies from unflagged users' do
    comment = wip.comments.create(wip: Task.make!, user: admin, body: 'okay')
    expect(comment.notify_by_email?).to be(true)
  end

  it 'does not notify from flagged users' do
    flagged_comment = wip.comments.create(user: flagged_user, body: '1!1')
    expect(flagged_comment.notify_by_email?).to be(false)
  end
end
