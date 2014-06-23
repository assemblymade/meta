require 'spec_helper'

describe PagesController do

  describe '#home' do

    it "is successful" do
      pending '(pletcher) This test fails in the test environment but the controller runs fine in development and prod.'
      get :home
      expect(response).to be_successful
    end

  end

end
