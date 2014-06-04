require 'spec_helper'

describe DigestMailer do
  describe 'instructions' do
    let(:user) { User.make! }
    let(:product) { Product.make! }
    let(:entities) { [product.discussions.make!(user: user)] }
    let(:article_ids) { entities.map{|e| {type: e.class.to_s, id: e.id }} }
    let(:mail) { DigestMailer.daily(user.id, article_ids) }

    it 'renders the subject' do
      expect(mail.subject).to eql("1 update on #{entities.first.product.name}")
    end

    it 'sets unsubscribe tag' do
      expect(mail.header.find{|h| h.name == 'X-Mailgun-Tag'}.value).to eq('digest#daily')
    end
  end
end
