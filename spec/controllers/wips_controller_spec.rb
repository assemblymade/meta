require 'spec_helper'

describe TasksController do
  let(:user) { User.make! }
  let(:product) { Product.make!(user: user, is_approved: true) }
  let(:wips) { [Task.make!(user: user, product: product)] }

  describe '#index' do
    before do
      sign_in user

      wips

      get :index, product_id: product.slug
    end

    it "is succesful" do
      expect(response).to be_successful
    end

    it "assigns wips" do
      expect(assigns(:wips)).to be
    end
  end
end
