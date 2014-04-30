require 'spec_helper'

describe SavedSearchesController do
  let(:user) { User.make! }

  describe '#create' do
    before do
      sign_in user
      post :create, saved_search: { query: 'tag:go' }
    end

    it 'creates a saved search' do
      expect(assigns(:saved_search).query).to eq('tag:go')
    end
  end
end