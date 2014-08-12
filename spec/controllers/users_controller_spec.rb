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

  describe '#tracking' do
    before do
      sign_in user
    end

    it "returns a ReadRaptor tracking URL" do
      get :tracking, article_id: wips[0][:id]

      expect(response.response_code).to eq(200)
      expect(response.body).to include(".gif")
    end
  end
end
