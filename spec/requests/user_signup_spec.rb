require 'spec_helper'

describe 'User signup' do
  it 'redirects to the discover page after home page signup' do
    post "/signup", user: { username: 'lumpy', email: 'lumpy@spaceprincesses.com', password: 'whatevers' }

    expect(assigns(:user).username).to eq('lumpy')

    expect(response).to redirect_to('/welcome')
  end

  it 'creates a user and redirects to the previous page' do
    get '/discover/updates'
    post "/signup", user: { username: 'lumpy', email: 'lumpy@spaceprincesses.com', password: 'whatevers' }

    expect(assigns(:user).username).to eq('lumpy')

    expect(response).to redirect_to('/welcome')
  end
end

