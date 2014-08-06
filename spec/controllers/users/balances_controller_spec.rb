require 'spec_helper'

describe Users::BalancesController do
  describe '#show' do
    it 'is successful' do
      get :show

      expect(response).to be_successful
    end
  end
end