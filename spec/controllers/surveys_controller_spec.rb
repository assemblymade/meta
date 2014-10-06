require 'spec_helper'

describe SurveysController do

  let(:user) { User.make! }

  describe "#new" do
    it "is successful" do
      sign_in(user)
      get :new
      expect(response).to be_successful
    end
  end

  describe "#create" do
    it "redirects to #show" do
      sign_in(user)
      post :create
      expect(response).to redirect_to('/welcome/thanks')
    end
  end

  describe "#show" do
    it "is successful" do
      sign_in(user)
      get :show
      expect(response).to be_successful
    end
  end
end
