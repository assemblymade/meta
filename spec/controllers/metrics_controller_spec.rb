require 'spec_helper'

describe MetricsController do
  let(:product) { Product.make! }


  describe "#index" do
    it "creates a new metric" do
      get :index, product_id: product.slug, format: :json

      expect(JSON.parse(response.body)['analytics_snippet']).to be_blank
    end
  end

end
