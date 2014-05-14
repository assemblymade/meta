require 'spec_helper'

describe ProductsController do
  render_views

  let(:creator) { User.make! }
  let(:product) { Product.make! }

  describe '#new' do
    it "is successful" do
      get :new
      expect(response).to be_success
    end
  end

  describe '#show' do
    it "is successful" do
      get :show, id: product.slug
      expect(response).to be_success
    end
  end

  describe '#edit' do
    it "is successful" do
      product.core_team << product.user
      sign_in product.user
      get :edit, id: product.slug
      expect(response).to be_success
    end
  end

  describe '#create' do
    before do
      sign_in creator
    end

    it "create's product" do
      post :create, product: { name: 'KJDB', pitch: 'Manage your karaoke life' }
      expect(assigns(:product)).to be_a(Product)
      expect(assigns(:product)).to be_persisted
    end

    it 'should redirect to show page' do
      post :create, product: { name: 'KJDB', pitch: 'Manage your karaoke life' }
      expect(response).to redirect_to(product_path(assigns(:product)))
    end

    it 'auto upvotes product' do
      expect {
        post :create, product: { name: 'KJDB', pitch: 'Manage your karaoke life' }
      }.to change(Vote, :count).by(1)
    end

    it 'adds validated transaction entry for product' do
      post :create, product: { name: 'KJDB', pitch: 'Manage your karaoke life' }

      expect(TransactionLogEntry.validated.count).to eq(1)
    end
  end
end
