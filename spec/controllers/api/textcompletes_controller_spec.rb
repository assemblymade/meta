require 'spec_helper'

describe Api::TextcompletesController do
  let!(:product) { Product.make!(slug: 'helpful') }
  let!(:users) {
    [['vanstee', 'Patrick'], ['vanstew', 'Pat']].each do |username, name|
      User.make!(username: username, name: name)
    end
  }

  it 'responds with a list of possible completions' do
    get :index,
      product_id: 'helpful',
      query: '@van',
      format: :json

    expect(JSON.parse(response.body)['textcompletes']).to match_array([['@vanstee', 'Patrick'], ['@vanstew', 'Pat']])
  end
end

