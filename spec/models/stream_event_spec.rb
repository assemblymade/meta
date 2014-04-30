require 'spec_helper'

describe StreamEvent do
  
  it 'creates a stream event for a new wip created' do
    wip   = Task.make!
    event = StreamEvent.add_create_event!(actor: wip.user, subject: wip, target: wip.product)
    event.verb.should == 'create'
  end
  
  it 'populates product_id from subject and product' do
    wip   = Task.make!
    event = StreamEvent.add_create_event!(actor: wip.user, subject: wip, target: wip.product)
    event.product_id.should_not be_nil
  end
  
end