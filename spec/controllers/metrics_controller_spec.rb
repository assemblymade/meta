require 'spec_helper'

describe MetricsController do
  let(:product) { Product.make! }


  describe "#snippet" do
    it "show snippet" do
      get :snippet, product_id: product.slug, format: :json

      expect(JSON.parse(response.body)['analytics_snippet']).to be_blank
    end
  end

end
