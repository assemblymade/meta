require 'spec_helper'

describe ContractsController do
  let(:staff_user) { User.make!(is_staff: true) }
  let(:user) { User.make! }
  let(:product) { Product.make! }

  describe '#create' do
    it 'creates a contract' do
      sign_in staff_user

      post :create, format: :json, product_id: product.slug, contract: { user: staff_user.username, amount: 0.1 }

      expect(response.status).to eq(201)
      expect(AutoTipContract.where(product: product, user: staff_user)).to exist
    end

    it 'does not allow unauthorized users to create contracts' do
      sign_in user

      post :create, product_id: product.slug, contract: { user: staff_user.username, amount: 0.1 }

      expect(response).to redirect_to(root_path)
    end
  end

  describe '#update' do
    let!(:contract) { AutoTipContract.create!(product: product, user: staff_user, amount: 0.1) }

    it 'updates a contract' do
      sign_in staff_user

      patch :update, format: :json, product_id: product.slug, id: contract.id, contract: { user: staff_user.id, amount: 0.2 }

      expect(response).to be_successful
      expect(contract.reload).to_not be_active
      expect(AutoTipContract.where(product: product, user: staff_user).where('ROUND(amount, 3) = ?', 0.002)).to exist
    end

    it 'does not let allow unauthorized users to update contracts' do
      sign_in user

      patch :update, format: :json, product_id: product.slug, id: contract.id, contract: { user: staff_user.id, amount: 0.1 }

      expect(response).to redirect_to(root_path)
    end
  end

  describe '#destroy' do
     let!(:contract) { AutoTipContract.create!(product: product, user: staff_user, amount: 0.1) }

    it 'destroys a contract' do
      sign_in staff_user

      delete :destroy, format: :json, product_id: product.slug, id: contract.id

      expect(response.status).to eq(204)
    end

    it 'does not allow unauthorized users to destroy contracts' do
      sign_in user

      delete :destroy, format: :json, product_id: product.slug, id: contract.id

      expect(response).to redirect_to(root_path)
    end
  end

end
