require 'spec_helper'

describe EmailCampaigns::HeartsReceived do
  # wait half an hour, then send aggregate
  # don't send another one for 3 hours

  let(:author) { User.make!(is_staff: true) }
  let(:heartable) { NewsFeedItem.make!(source: author) }

  it 'collects hearts for users with stuff hearted' do
    heart1 = Heart.make!(heartable: heartable, created_at: 60.minutes.ago)
    heart2 = Heart.make!(heartable: heartable, created_at: 45.minutes.ago)

    expect(
      EmailCampaigns::HeartsReceived.new.process![author.id]
    ).to match_array([heart1.id, heart2.id])
  end

  it "won't send if sent less than 3 hours ago" do
    Heart.make!(created_at: 21.minutes.ago, sent_at: Time.now, heartable: heartable)
    heart = Heart.make!(created_at: 15.minutes.ago, heartable: heartable)

    expect(
      EmailCampaigns::HeartsReceived.new.process!
    ).to eq({})
  end

  it "won't send if newest heart is newer than 30 minutes ago" do
    heart = Heart.make!(created_at: 29.minutes.ago, heartable: heartable)

    expect(
      EmailCampaigns::HeartsReceived.new.process!
    ).to eq({})
  end

  it "doesn't send you your own hearts" do
    heart = Heart.make!(created_at: 60.minutes.ago, heartable: heartable, user: author)

    expect(
      EmailCampaigns::HeartsReceived.new.process!
    ).to eq({})
  end
end
