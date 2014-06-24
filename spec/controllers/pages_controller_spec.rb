require 'spec_helper'

describe PagesController do

  describe '#home' do

    it "is successful" do
      %w(helpful
      family-table
      buckets
      really-good-emails).each {|slug| Product.make!(slug: slug) }

      get :home
      expect(response).to be_successful
    end

  end

end
