require 'spec_helper'

describe Webhooks::ReadRaptorController do
  let(:user) { User.make! }
  let(:product) { Product.make! }
  let(:wips) { [product.tasks.make!, product.tasks.make!] }
  let(:comments) { [wips[0].comments.make!, wips[1].comments.make!] }


  describe 'immediate' do
    before do
      post :immediate,
        user: user.id,
        pending: (wips.map{|o| "#{o.class}_#{o.id}" } + comments.map{|o| "#{o.class}_#{o.id}" })
    end

    it "returns 200" do
      expect(response.response_code).to eq(200)
    end
  end

end
