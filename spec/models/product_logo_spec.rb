require 'spec_helper'

describe ProductLogo do
  let(:user) { User.make! }
  let(:attachment) { Attachment.make! }
  let(:product) { Product.make! }

  describe '#create' do
    it 'creates a product_logo' do
      expect(ProductLogo.create(name: 'archer.png', attachment: attachment, user: user, product: product)).to be_a(ProductLogo)
    end
  end
end
