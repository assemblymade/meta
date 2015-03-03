require 'spec_helper'

describe MetricsController do
  let(:product) { Product.make! }
  let(:user) { User.make!(is_staff: true)}

  describe "#snippet" do
    it "show snippet" do
      sign_in user
      get :snippet, product_id: product.slug, format: :json

      expect(JSON.parse(response.body)['analytics_snippet']).to be_blank
    end
  end

end
