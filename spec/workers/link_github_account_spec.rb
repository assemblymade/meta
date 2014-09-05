require 'spec_helper'

describe LinkGithubAccount do
  let(:user) { User.make! }

  context 'regular' do
    it 'sets attributes' do
      expect {
        LinkGithubAccount.new(user, '78412', 'whatupdave').perform
      }.to change{ user.github_uid }.to(78412)
    end
  end

  context 'on core teams' do
    let(:product) { Product.make! }

    before {
      product.repos << Repo::Github.new('https://github.com/whatupdave/partystarter')
      product.core_team << user
      product.save!
    }

    it 'adds as collaborator to github repos' do
      expect {
        LinkGithubAccount.new(user, '78412', 'whatupdave').perform
      }.to change{ Github::AddCollaboratorToProductRepoWorker.jobs.size }.by(1)
    end
  end
end