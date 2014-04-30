require 'spec_helper'

describe HomeController do

  describe '#show' do

    before do
      Product.make!(slug: 'helpful')
      get :show
    end

    it "returns 200" do
      expect(response.response_code).to eq(200)
    end

  end

end
