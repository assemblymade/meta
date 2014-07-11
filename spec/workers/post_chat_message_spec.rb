require 'spec_helper'
require 'sidekiq/testing'

Sidekiq::Testing.fake!

describe PostChatMessage do
  let(:product) { Product.make! }

  describe '#perform' do
    it 'posts a chat message from @kernel in a product' do
      PostChatMessage.perform_async(product.slug, 'hello, world!')
      expect(PostChatMessage.jobs.size).to eq 1
    end

    let(:task) { Task.make!(product: product) }

    context 'product has activity' do

      let(:activity) { Activity.make!(target: product, type: 'Activities::Start') }

      it 'returns false' do
        pcm = PostChatMessage.new
        expect(pcm.perform(product.slug, 'hello, world!')).to eq(false)
      end
    end
  end
end
