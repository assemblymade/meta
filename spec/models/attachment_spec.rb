require 'spec_helper'

describe Attachment do
  describe '#url' do
    it 'encodes the url, escaping whitespace etc.' do
      attachment = Attachment.create!(name: 'this name has spaces')

      expect(attachment.url).to include('this%20name%20has%20spaces')
    end
  end

  describe '#assign_to_product!' do
    let(:product) { Product.make! }
    let(:user) { User.make! }
    let(:attachment) { Attachment.make!(user: user) }

    it 'adds the attachment to the given product' do
      attachment.assign_to_product!(product, user)

      expect(product.assets.where(attachment_id: attachment.id)).to exist
    end
  end
end
