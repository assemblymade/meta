require 'spec_helper'

describe GlobalInterestsController do
  let(:user) { User.make! }

  describe '#toggle' do
    before do
      sign_in user
    end

    it 'creates an interest for a user' do
      get :toggle, { interest: 'frontend', format: :json }

      expect(JSON.parse(response.body)["frontend"]).not_to be_nil
    end

    it 'does not work with an unacceptable interest' do
      expect(get :toggle, { interest: 'dogs', format: :json }).not_to be_successful
    end

    it 'toggles an interest if it already exists' do
      get :toggle, { interest: 'frontend', format: :json }

      expect(JSON.parse(response.body)["frontend"]).not_to be_nil

      get :toggle, { interest: 'frontend', format: :json }

      expect(JSON.parse(response.body)["frontend"]).to be_nil
    end
  end
end
