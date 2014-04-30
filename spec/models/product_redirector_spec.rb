require 'spec_helper'

describe ProductRedirector do
  let!(:product) { Product.make! }
  let!(:task) { Task.make!(product: product) }
  let!(:discussion) { Discussion.make!(product: product) }

  describe "#call" do
    it 'returns the task path with product slug and task number' do
      redirector = ProductRedirector.new(:task)
      path = redirector.call({ product_id: product.id, id: task.id }, nil)
      expect(path).to eq("/#{product.slug}/wips/#{task.number}")
    end

    it 'returns the discussion path with product slug and discussion number' do
      redirector = ProductRedirector.new(:discussion)
      path = redirector.call({ product_id: product.id, id: discussion.id }, nil)
      expect(path).to eq("/#{product.slug}/discussions/#{discussion.number}")
    end
  end
end
