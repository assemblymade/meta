require 'spec_helper'

describe WatchersController do

  let(:product) { Product.make! }

  describe "#index" do

    it "is successful" do
      get :index, product_id: product.slug, format: :json
      expect(response).to be_successful
    end

  end

end
