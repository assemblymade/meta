require 'spec_helper'

describe Idea do
  let(:user) { User.make! }

  it 'has associated NewsFeedItem on create' do
    expect {
      idea = Idea.create!(user: user, name: "idea name", body: "idea body")
      idea.run_callbacks(:commit)
    }.to change(NewsFeedItem, :count).by(1)
  end

  it 'To score meant there was Love' do
    idea = Idea.create!(user: user, name: "idea name", body: "idea body")
    idea.run_callbacks(:commit)
    idea.reload
    heart1 = Heart.make!(heartable: idea.news_feed_item, created_at: 60.minutes.ago)
    expect {idea.hearted}.to change(idea, :score)
  end

  it 'Unloved Hearts have no score..' do
    idea = Idea.create!(user: user, name: "idea name", body: "idea body")
    idea.run_callbacks(:commit)
    idea.reload
    heart1 = Heart.make!(heartable: idea.news_feed_item, created_at: 60.minutes.ago)
    idea.hearted
    idea.unhearted(heart1)
    expect(idea.score).to eq(0)
  end

  it 'get idea participants list' do
    idea = Idea.create!(user: user, name: "idea name", body: "idea body")
    idea.run_callbacks(:commit)
    idea.reload
    participants = idea.participants
    expect(participants).to eq([user])
  end

end
