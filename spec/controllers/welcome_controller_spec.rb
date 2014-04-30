require 'spec_helper'

describe WelcomeController do
  let!(:user) { User.make! }

  before { sign_in(user) }

  it 'assigns tasks to encourage the user to vote' do
    get :index

    expect(assigns(:code_tasks)).to be
    expect(assigns(:design_tasks)).to be
  end
end
