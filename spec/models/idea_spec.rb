require 'spec_helper'

describe Idea do
  let(:user) { User.make! }

  it 'has associated NewsFeedItem after create' do
    expect {
      idea = Idea.create!(user: user, name: "idea name", body: "idea body")
      idea.run_callbacks(:commit)
    }.to change(NewsFeedItem, :count).by(1)
  end
end

