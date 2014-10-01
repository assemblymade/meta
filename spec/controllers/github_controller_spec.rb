require 'spec_helper'

describe Webhooks::GithubController do

  let(:product) { Product.make!(repos: [Repo::Github.new('https://github.com/support-foo/web')]) }
  let!(:wip) { product.tasks.make!(number: 5, product: product) }
  let!(:user) { User.make!(github_uid: 7064, github_login: 'whatupdave') }

  describe 'push' do
    before do
      request.headers["HTTP_ACCEPT"] = "application/json"
      request.headers["X-Github-Event"] = "push"
      post :create, JSON.parse(File.read(Rails.root.join('spec/fixtures/github/push.json')))
    end

    it 'creates work with url' do
      expect(Work.first.url).to eq('https://github.com/support-foo/web/commit/ca201959a7e87794c8d30edd3cbeaf8a341adc46')
    end

    it 'creates work with username' do
      expect(Work.first.metadata['author']['username']).to eq('whatupdave')
    end

    it 'returns 200' do
      expect(response.response_code).to eq(200)
    end
  end
end
