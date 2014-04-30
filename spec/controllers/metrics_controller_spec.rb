require 'spec_helper'

describe MetricsController do
  describe "authentication" do
    it "allows users with the correct credentials to create metrics" do
      product = Product.make!(slug: "helpful")
      authorize_as_product(product)

      post :create, { counters: [] }

      expect(response.response_code).to eq(200)
    end

    it "returns an error if incorrect credentials are used" do
      post :create

      expect(response.response_code).to eq(401)
      expect(response.body).to eq({ errors: { request: ["Authorization Required"] } }.to_json)
    end
  end

  describe "#create" do
    it "creates a new metric" do
      product = Product.make!(slug: "helpful")
      authorize_as_product(product)

      post :create,
        {
          counters: [
            {
              name: "sign-ups",
              value: 1,
            },
            {
              name: "conversations",
              value: 1,
            }
          ]
        }

      expect(response.response_code).to eq(200)
      expect(response.body).to be_blank
    end
  end

  def authorize_as_product(product)
    request.env['HTTP_AUTHORIZATION'] = ActionController::HttpAuthentication::Basic.encode_credentials(product.slug, product.authentication_token)
  end
end
