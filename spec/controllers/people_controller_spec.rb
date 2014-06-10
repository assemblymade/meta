require 'spec_helper'

describe PeopleController do
  let(:product) { Product.make! }

  describe 'GET #show' do
    it 'is successful' do
      get :index, product_id: product.slug

      expect(response).to be_successful
    end
  end
end
