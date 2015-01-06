require 'spec_helper'

describe AssetsController do
  let(:current_user) { User.make! }

  describe '#create' do
    let(:current_user) { User.make! }
    let(:product) { Product.make!(user: current_user) }
    let(:attachment) { Attachment.make!(user: current_user) }
    let(:wip) { Task.make!(product: product, user: current_user) }
    let(:event) {
      Event::Comment.make!(
        attachments: [attachment.id],
        user: current_user,
        wip: wip
      )
    }

    before do
      sign_in current_user
    end

    it "transfers an event's attachments if passed an event_id" do
      expect(product.assets.count).to eq(0)

      post :create, product_id: product.slug, event_id: event.id

      expect(product.assets.count).to eq(1)
      expect(assigns(:asset).product).to eq(product)
    end

    it "transfers one attachment if passed an attachment_url" do
      expect(product.assets.count).to eq(0)

      post :create, product_id: product.slug, attachment_url: attachment.url

      expect(product.assets.count).to eq(1)
      expect(assigns(:asset).product).to eq(product)
    end

    it "creates an asset if passed an attachment_id and name" do
      expect(product.assets.count).to eq(0)

      post :create, product_id: product.slug, asset: { attachment_id: attachment.id, name: 'Caddy' }

      expect(product.assets.count).to eq(1)
      expect(assigns(:asset).product).to eq(product)
    end
  end
end
