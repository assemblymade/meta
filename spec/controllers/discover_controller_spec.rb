require 'spec_helper'

describe DiscoverController do
  [:index, :profitable, :greenlit, :teambuilding, :updates].each do |action|
    describe "GET ##{action}" do
      it "is successful" do
        get action.to_sym

        expect(response).to be_successful
      end
    end
  end

  describe "GET #bounties" do
    it "redirects" do
      get :bounties

      expect(response.status).to eq(302)
    end
  end
end
