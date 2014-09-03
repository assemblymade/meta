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
      expect(body["core_team"][0]["avatar_url"]).to eq(user.avatar.url.to_s)
    end
  end

  describe '#core_team' do
    let!(:core_team) { User.make!(authentication_token: 'foobarbaz') }
    let!(:user) { User.make!(authentication_token: '424242') }
    let!(:product) { Product.make!(slug: 'roachface-killah') }

    before do
      product.core_team << core_team
    end

    it 'returns true for a core team member' do
      get :core_team,
        product_id: 'roachface-killah',
        token: 'foobarbaz',
        format: :json

      body = JSON.parse(response.body)
      expect(body["authorized"]).to eq(true)
    end

    it 'returns false for a non-core team member' do
      get :core_team,
        product_id: 'roachface-killah',
        token: '424242',
        format: :json

      body = JSON.parse(response.body)
      expect(body["authorized"]).to eq(false)
    end
  end
end
