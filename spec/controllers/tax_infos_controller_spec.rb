require 'spec_helper'

describe Users::TaxInfosController do
  let(:user) { User.make! }

  it 'can create w9' do
    sign_in user
    post :create, user_tax_info: {
      address: '123 Spaghetti St',
      business_name: 'Vanderlay industries',
      city: 'Spokane',
      classification: 'Individual/sole proprietor',
      date_of_birth: [1979, 12, 29],
      full_name: 'George Costanza',
      taxpayer_id: '123443211',
      taxpayer_type: 'SSN',
      signature: 'George Constanza',
      state: 'CA',
      zip: 90210
    }

    expect(assigns(:tax_info)).to be_persisted
  end
end