require 'spec_helper'

describe ProductLogosController do
  let(:product) { Product.make! }
  let(:user) { User.make!}

  describe '#create' do
    before do
      sign_in user
    end

    it 'creates a product logo' do
      post :create, product_id: product.slug, name: 'ford_prefect.png', size: 13124, content_type: 'image/png'
      expect(assigns(:logo)).to be
    end
  end
end
