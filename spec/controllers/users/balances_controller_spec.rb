require 'spec_helper'

describe Users::BalancesController do
  let(:user) { User.make! }

  describe '#show' do
    it 'is successful' do
      sign_in user
      get :show
      expect(response).to be_successful
    end
  end
end