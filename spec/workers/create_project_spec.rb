require 'spec_helper'
require 'sidekiq/testing'

Sidekiq::Testing.fake!

describe CreateProject do
  let!(:product) { Product.make! }
  let!(:user) { User.make!(username: 'kernel') }

  describe '#perform' do
    it 'creates a project' do
      # TODO: It would be great if this spec tested the request result,
      #       i.e., if it checked that a milestone was created.
      CreateProject.perform_async(product.slug)
      expect(CreateProject.jobs.size).to eq(1)
    end
  end
end
