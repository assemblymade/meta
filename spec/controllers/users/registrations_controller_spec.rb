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

      it "redirects to the discover products page by default" do
        post(:create, user: user_attributes)
        expect(response).to redirect_to(discover_path)
      end
    end
  end

end
