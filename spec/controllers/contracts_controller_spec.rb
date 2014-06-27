require 'spec_helper'

describe ContractsController do
  let(:staff_user) { User.make!(is_staff: true) }
  let(:user) { User.make! }
  let(:product) { Product.make! }
  let(:contract) { AutoTipContract.make! }

  describe '#create' do
    it 'creates a contract' do
      sign_in staff_user

      post :create, format: :json, product_id: product.slug, contract: { user: staff_user.username, amount: 0.1 }
      expect(response.status).to eq(201)
      expect(assigns(:contract))

      sign_out staff_user
    end

    it 'does not allow unauthorized users to create contracts' do
      sign_in user

      post :create, product_id: product.slug, contract: { user: staff_user.username, amount: 0.1 }
      expect(response).to redirect_to(new_user_session_path)
    end
  end

  describe '#update' do
    before do
      AutoTipContract.create!(product: product, user: staff_user, amount: 0.1)
    end

    after(:each) do
      sign_out staff_user
    end

    it 'updates a contract' do
      sign_in staff_user

      patch :update, format: :json, product_id: product.slug, id: contract.id, contract: { user: staff_user.id, amount: 0.1 }
      expect(response.status).to eq(201)
      expect(assigns(:contract))
    end

    it 'does not let allow unauthorized users to update contracts' do
      sign_in user

      patch :update, format: :json, product_id: product.slug, id: contract.id, contract: { user: staff_user.id, amount: 0.1 }
      expect(response).to redirect_to(new_user_session_path)
    end
  end

  describe '#destroy' do
    before do
      @contract_id = AutoTipContract.create!(product: product, user: staff_user, amount: 0.1).id
    end

    after(:each) do
      sign_out staff_user
    end

    it 'destroys a contract' do
      sign_in staff_user

      delete :destroy, format: :json, product_id: product.slug, id: @contract_id
      expect(response.status).to eq(204)
    end

    it 'does not allow unauthorized users to destroy contracts' do
      sign_in user

      delete :destroy, format: :json, product_id: product.slug, id: @contract_id
      expect(response).to redirect_to(new_user_session_path)
    end
  end

end
