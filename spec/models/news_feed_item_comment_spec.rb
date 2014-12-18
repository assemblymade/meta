require 'spec_helper'

describe NewsFeedItemComment do
  it 'has mentioned users, excluding author' do
    pletcher = User.make!(username: 'pletcher')
    whatupdave = User.make!(username: 'whatupdave')

    comment = NewsFeedItemComment.make!(user: pletcher, body: '@whatupdave it is I, @pletcher')
    expect(comment.mentioned_users).to eq([whatupdave])
  end

  describe '#notify_subscribers!' do
    let(:author) { User.make! }
    let(:subscriber) { User.make! }
    let(:product_follower) { User.make! }
    let(:no_emails) { User.make!(mail_preference: User::MAIL_NEVER) }

    let(:nfi) { NewsFeedItem.make! }
    let(:thread_author) { nfi.source }

    it 'registers callbacks for thread subscribers' do
      Watching.watch!(subscriber, nfi)
      comment = nfi.comments.create!(user: author, body: 'sup')
      comment.notify_subscribers!

      job_args = ReadRaptor::RegisterArticleWorker.jobs.first['args'][0]

      expect(ReadRaptor::RegisterArticleWorker.jobs.size).to eq(1)
      expect(job_args['key']).to eq("NewsFeedItemComment_#{comment.id}")
      expect(job_args['recipients']).to match_array([thread_author.id, subscriber.id])
      expect(job_args['via']).to_not be_nil
    end

    it 'adds to daily digest for product followers' do
      Watching.watch!(product_follower, nfi.product)
      comment = nfi.comments.create!(user: author, body: 'sup')
      comment.notify_subscribers!

      job = ReadRaptor::RegisterArticleWorker.jobs.find{|j| j['args'][0]['via'].nil? }
      job_args = job['args'][0]
      expect(job_args['recipients']).to match_array([product_follower.id])
    end
  end
end
