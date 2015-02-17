require 'spec_helper'

describe AssetsController do
  let(:current_user) { User.make! }

  describe '#create' do
    let(:product) { Product.make!(user: current_user) }
    let(:attachment) { Attachment.make!(user: current_user) }
    let(:wip) { Task.make!(product: product, user: current_user) }

    before do
      sign_in current_user
    end

    it "assigns an asset to a product" do
      post :create, product_id: product.slug, attachment_url: attachment.url

      expect(assigns(:asset).product).to eq(product)
    end

    it "transfers one attachment if passed an attachment_url" do
      expect {
        post :create, product_id: product.slug, attachment_url: attachment.url
      }.to change(Asset, :count).by(1)

      expect(assigns(:asset).product).to eq(product)
    end

    it "creates an asset if passed an attachment_id and name" do
      expect {
        post :create, product_id: product.slug, asset: { attachment_id: attachment.id, name: 'Caddy' }
      }.to change(Asset, :count).by(1)
    end
  end

  describe "#destroy" do
    let(:product) { Product.make!(user: current_user) }
    let(:attachment) { Attachment.make!(user: current_user) }
    let(:asset) { Asset.make!(name: 'asset', attachment: attachment) }

    context "core team" do
      before do
        sign_in current_user
      end

      it "can delete an asset" do
        delete :destroy, product_id: product.slug, id: asset.id

        expect(response.status).to eq(302)
      end
    end

    context "non-core team" do
      let(:non_core) { User.make! }

      before do
        sign_in non_core
      end

      it "cannot delete an asset" do
        delete :destroy, product_id: product.slug, id: asset.id

        expect(response).not_to be_successful
      end
    end
  end
end
