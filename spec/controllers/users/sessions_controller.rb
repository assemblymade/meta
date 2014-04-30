require 'spec_helper'

describe Users::SessionsController do

  before { @request.env["devise.mapping"] = Devise.mappings[:user] }

  describe "GET #new" do
    it "is successful" do
      get :new
      expect(response).to be_successful
    end
  end

end
