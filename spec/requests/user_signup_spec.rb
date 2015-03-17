require 'spec_helper'

describe 'User signup' do
  let!(:kernel) { User.make!(username: 'kernel') }

  it 'redirects to the discover page after home page signup' do
    post "/signup", user: { username: 'lumpy', email: 'lumpy@spaceprincesses.com', password: 'whatevers' }

    expect(assigns(:user).username).to eq('lumpy')

    expect(response).to redirect_to('/discover')
  end

  it 'creates a user and redirects to the previous page' do
    get discover_path
    post "/signup", user: { username: 'lumpy', email: 'lumpy@spaceprincesses.com', password: 'whatevers' }

    expect(assigns(:user).username).to eq('lumpy')

    expect(response).to redirect_to('/discover')
  end
end
