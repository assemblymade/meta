require 'spec_helper'

describe Deliverable do
  let(:wip) { Task.make! }
  let(:attachment) { Attachment.make! }

  it 'belongs to wips' do
    expect {
      wip.deliverables.create! attachment: attachment
    }.to change { wip.deliverables.size }.to 1
  end
end
