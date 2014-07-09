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

    it 'creates a main discussion thread' do
      expect {
        post :create, product: { name: 'KJDB', pitch: 'Manage your karaoke life' }
      }.to change(Discussion, :count).by(1)

      expect(assigns(:product).main_thread).to be_persisted
    end
  end

  describe '#launch' do
    let(:product) { Product.make!(launched_at: nil) }

    before do
      sign_in creator
    end

    it "redirects to product slug" do
      patch :launch, product_id: product.id
      expect(response).to redirect_to(product_path(product.slug))
    end

    it 'publishes activity' do
      expect {
        patch :launch, product_id: product.id
      }.to change(Activity, :count).by(1)
    end

    it 'sets product to launched' do
      expect {
        patch :launch, product_id: product.id
      }.to change{product.reload.launched_at.to_i}.to(Time.now.to_i)
    end
  end
end
