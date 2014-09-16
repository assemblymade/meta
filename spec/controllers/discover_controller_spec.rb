require 'spec_helper'

describe DiscoverController do
  [:index, :profitable, :greenlit, :teambuilding, :bounties, :updates].each do |action|
    describe "GET ##{action}" do
      it "is successful" do
        get action.to_sym
        expect(response).to be_successful
      end
    end
  end
end
