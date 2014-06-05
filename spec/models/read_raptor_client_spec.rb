require 'spec_helper'

describe ReadRaptorClient do
  let(:user) { User.make! }
  let(:entities) { [Task.make!, Task.make!] }
  let(:entity_ids) { entities.map(&:id) }

  it 'retrieves undelivered entities' do
    client = ReadRaptorClient.new
    article_ids = ["Task_#{entities[0].id}", "Task_#{entities[0].id}_email", "Task_#{entities[1].id}_email"]

    allow(client).to receive(:get).and_return(article_ids.map{|id| {'key' => id} })

    expect(
      client.undelivered_articles(user.id)
    ).to match_array([{type: "Task", id: entities[0].id, tags: [nil, "email"]}])
  end
end
