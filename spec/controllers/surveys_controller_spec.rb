require 'spec_helper'

describe SurveysController do
  describe "#new" do
    it "is successful" do
      get :new
      expect(response).to be_successful
    end
  end

  describe "#create" do
    it "redirects to #show" do
      post :create
      expect(response).to redirect_to('/welcome/thanks')
    end
  end

  describe "#show" do
    it "is successful" do
      get :show
      expect(response).to be_successful
    end
  end
end
