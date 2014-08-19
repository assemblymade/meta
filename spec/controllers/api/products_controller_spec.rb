require 'spec_helper'

describe Api::ProductsController do
  describe '#info' do
    let!(:user) { User.make! }
    let!(:product) { Product.make!(slug: 'roachface-killah') }

    before do
      product.core_team << user
    end

    it "gets a product's information" do
      get :info,
        product_id: 'roachface-killah',
        format: :json

      body = JSON.parse(response.body)
      expect(body["name"]).to eq(product.name)
      expect(body["core_team"][0]["username"]).to eq(user.username)
      expect(body["core_team"][0]["avatar_url"]).to eq(user.avatar_url)
    end
  end
end
