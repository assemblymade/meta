require 'spec_helper'

describe DiscoverController do

  describe "GET #staff_picks" do

    it "is successful" do
      get :staff_picks
      expect(response).to be_successful
    end

  end

  describe "GET #trending" do

    it "is successful" do
      get :trending
      expect(response).to be_successful
    end

  end

  describe "GET #most_wanted" do

    it "is successful" do
      get :most_wanted
      expect(response).to be_successful
    end

  end

end
