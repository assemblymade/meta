require 'spec_helper'

describe Event::Comment do
  let(:wip) { Discussion.make! }
  let(:admin) { User.make! }
  subject { wip.comments.make! body: 'hello foo!' }

  describe 'history' do
    before {
      subject.update_attributes body: 'hello bar!', updated_by: admin
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
  
end