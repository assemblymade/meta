require 'spec_helper'

describe PeopleController do
  let(:product) { Product.make! }
  let(:user) { User.make! }

  describe 'GET #show' do
    it 'is successful' do
      get :index, product_id: product.slug

      expect(response).to be_successful
    end
  end

  describe 'POST #create' do
    before do
      sign_in user
    end

    it 'is successful' do
      post :create, product_id: product.slug, format: :json

      expect(response).to be_successful
    end

    it 'creates a membership' do
      post :create, product_id: product.slug, format: :json

      expect(assigns(:membership)).to be_persisted
    end
  end

  describe 'PATCH #update' do
    before do
      sign_in user
      post :create, product_id: product.slug, format: :json
    end

    it 'updates a user' do
      patch :update, product_id: product.slug, id: user.id, membership: { bio: 'foo' }, format: :json

      expect(response).to be_successful
    end
  end

  describe 'DELETE #destroy' do
    before do
      sign_in user
    end

    it 'removes a membership' do
      delete :destroy, product_id: product.slug, id: user.id, format: :json

      expect(response).to be_successful
    end
  end

end
