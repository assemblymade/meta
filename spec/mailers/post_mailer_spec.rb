require 'spec_helper'

describe PostMailer do
  describe 'created' do
    let(:user) { User.make! }
    let(:product) { Product.make! }
    let(:post) { Post.make!(product: product) }
    let(:mail) { PostMailer.created(post.id, user.id) }

    it 'renders the subject' do
      expect(mail.subject).to eql("[#{product.name}] #{post.title}")
    end

    it 'sets unsubscribe tag' do
      expect(mail.header.find{|h| h.name == 'X-Mailgun-Tag'}.value).to eq("post##{product.slug}")
    end
  end
end
