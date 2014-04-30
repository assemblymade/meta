require 'spec_helper'

describe UsersController do
  let(:user) { User.make! }
  let(:product) { Product.make!(user: user, is_approved: true) }
  let(:wips) { [Task.make!(user: user, product: product)] }

  describe '#show' do
    before do
      sign_in user

      wips

      get :show, id: user.username
    end

    it "returns 200" do
      expect(response.response_code).to eq(200)
    end

    it "assigns wips" do
      expect(assigns(:wips))
    end
  end
end
