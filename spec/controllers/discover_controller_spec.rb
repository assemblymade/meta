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

    it 'sets the filter to design if blank' do
      get :bounties

      expect(response).to redirect_to(discover_path(action: 'bounties', filter: 'design'))
    end

    it 'saves the filter as a cookie' do
      get :bounties, filter: 'backend'

      expect(response.cookies['discover_bounties_filter']).to eq('backend')
    end
  end
end
