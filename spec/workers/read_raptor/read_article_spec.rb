require 'spec_helper'
require 'sidekiq/testing'

Sidekiq::Testing.fake!

describe ReadRaptor::ReadArticle do
  describe '#perform' do
    it 'makes a request' do
      ReadRaptor::ReadArticle.perform_async('/foo')
      expect(ReadRaptor::ReadArticle.jobs.size).to eq 1
    end
  end
end
