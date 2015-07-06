require 'spec_helper'

describe Github::CreateProductRepoWorker do
  let(:product) { Product.make!(slug: 'testing-1-2-3') }

  it 'Creates a repo on Github with AGPL license' do
    VCR.use_cassette('create_github_repo') do
      Github::CreateProductRepoWorker.new.perform(product.id, 'https://cove.assembly.com', 'testing-1-2-3')

      info = Github::Worker.new.get("/repos/asm-products/testing-1-2-3/readme")
      expect(info['path']).to eq("README.md")
    end
  end
end