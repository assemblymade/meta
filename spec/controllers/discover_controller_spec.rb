require 'spec_helper'

describe DiscoverController do
  [:index, :profitable, :greenlit, :teambuilding, :bounties, :updates].each do |action|
    describe "GET ##{action}" do
      it "is successful" do
        get action.to_sym

        expect([200, 302].include?(response.status)).to be_true
      end
    end
  end
end
