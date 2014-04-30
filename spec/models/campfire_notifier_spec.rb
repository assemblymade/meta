require 'spec_helper'

describe CampfireNotifier do
  let!(:product) { Product.make!(slug: 'helpful') }
  let!(:task) { Task.make!(number: 42, product: product, title: 'make a mockup') }
  let!(:user) { User.make!(username: 'whatupdave') }

  context 'task created' do
    let!(:activity) {
      s = StreamEvent.add_create_event!(actor: user, subject: task, target: task.product)
      StreamEvent.find(s.id)
    }

    let(:notifier) { CampfireNotifier.new(activity) }

    it 'creates a message to send based on the activity verb, actor, and target' do
      expect(notifier.message).to eq("[helpful] @whatupdave created task make a mockup #42 (http://asm.co/helpful/wips/42)")
    end
  end

  context 'task commented' do
    let(:message) {
      "I am a long,
      boring,
      multi-line comment!"
    }
    let!(:activity) {
      task.events << (comment = Event::Comment.new(body: message, user_id: user.id))
      s = StreamEvent.add_create_event!(actor: user, subject: comment, target: task)
      StreamEvent.find(s.id)
    }

    let(:notifier) { CampfireNotifier.new(activity) }

    it 'creates a message to send based on the activity verb, actor, and target' do
      expect(notifier.message).to eq("[helpful#42] @whatupdave: I am a long, boring, multi-line comment! (http://asm.co/helpful/wips/42)")
    end
  end
end
