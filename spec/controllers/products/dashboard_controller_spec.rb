require 'spec_helper'

describe Products::DashboardController do
  let!(:user) { User.make! }
  let!(:product) { Product.make!(user: user, is_approved: true) }
  let!(:wips) { [Task.make!(user: user, product: product)] }

  describe '#index' do
    before do
      sign_in user
    end

    it "returns 200" do
      get :index, product_id: product.slug

      expect(response.response_code).to eq(200)
    end

  end
end
