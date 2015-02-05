require 'spec_helper'

describe HeartMailer do
  describe 'hearts_received' do
    let(:user) { User.make! }
    let(:admirer) { User.make! }
    let(:heartables) { [NewsFeedItem.make!(source: user), NewsFeedItem.make!(source: user)] }
    let(:hearts) { heartables.map{|h| h.hearts.create(user: admirer) } }

    it 'renders the subject' do
      mail = HeartMailer.hearts_received(user.id, hearts.map(&:id))
      expect(mail.subject).to eql("@#{admirer.username} likes your stuff!")
    end

    it 'sets unsubscribe tag' do
      mail = HeartMailer.hearts_received(user.id, hearts.map(&:id))
      expect(mail.header.find{|h| h.name == 'X-Mailgun-Tag'}.value).to eq('hearts')
    end
  end
end
