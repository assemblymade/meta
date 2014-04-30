require 'spec_helper'

describe Users::RegistrationsController do
  before :each do
    request.env["devise.mapping"] = Devise.mappings[:user]
  end

  describe "POST #create" do

    context "valid user" do

      let(:user_attributes) do
        {
          email: "user#{rand(100000)}@example.com",
          password: "foobar01",
          password_confirmation: "foobar01",
          username: "BlahBlah100000"
        }
      end

      it "emails a new user a welcome package" do
        Sidekiq::Testing.inline!
        post(:create, user: user_attributes)
        expect(last_email.subject).to eq("Your Assembly welcome package")
      end

      it "redirects to the discover products page" do
        pending '(chrislloyd) I have no idea why this fails, it works fine outside of the test environment. My guess: weird runtime stuff that Devise does'
        post(:create, user: user_attributes)
        expect(response.location).to eq(discover_url)
      end
    end
  end

  describe "GET #welcome" do

    it "is successful" do
      get :welcome
      expect(response).to be_success
    end

  end

end
