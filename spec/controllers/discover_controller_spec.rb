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

  describe "GET #recently_launched" do

    it "is successful" do
      get :recently_launched
      expect(response).to be_successful
    end

  end

end
