module Github
  class PullRequestUnknownUserWorker < Github::Worker
    def perform(repo, sha, github_login)
      post "/repos/#{repo}/statuses/#{sha}",
        state: 'pending',
        target_url: 'https://assemblymade.com/settings',
        description: "@#{github_login} needs to link their GitHub account on Assembly"
    end
  end
end