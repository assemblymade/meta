require 'spec_helper'

describe ProductLogosController do
  let(:attachment) { Attachment.make! }
  let(:product) { Product.make! }
  let(:user) { User.make! }

  describe '#create' do
    before do
      sign_in user
      product.core_team << user
    end

    it 'creates a logo' do
      post :create, product_id: product.slug, asset: { name: 'ford_prefect.png', attachment_id: attachment.id }
      expect(assigns(:product).logo).to be_a(Asset)
      expect(assigns(:product).poster_image).to be_a(Asset)
      expect(assigns(:product).logo.name).to eq('ford_prefect.png')
      expect(assigns(:product).poster_image.name).to eq('ford_prefect.png')
    end

    it 'creates a logo and sets it as the current logo' do
      post :create, product_id: product.slug, asset: { name: 'ford_prefect.png', attachment_id: attachment.id }
      expect(assigns(:product).logo).to be_a(Asset)
      expect(assigns(:product).poster_image).to be_a(Asset)
      expect(assigns(:product).logo.name).to eq('ford_prefect.png')
      expect(assigns(:product).poster_image.name).to eq('ford_prefect.png')

      post :create, product_id: product.slug, asset: { name: 'arthur_dent.png', attachment_id: attachment.id }
      expect(assigns(:product).logo).to be_a(Asset)
      expect(assigns(:product).poster_image).to be_a(Asset)
      expect(assigns(:product).logo.name).to eq('arthur_dent.png')
      expect(assigns(:product).poster_image.name).to eq('arthur_dent.png')
    end
  end
end
