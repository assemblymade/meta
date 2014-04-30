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
    subject { post :create, product: { name: 'Kay Jay Dee Bee' } }

    it 'should redirect to show page'
  end
end
