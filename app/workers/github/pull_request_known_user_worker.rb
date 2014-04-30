module Github
  class PullRequestKnownUserWorker < Github::Worker
    def perform(repo, sha)
      post "/repos/#{repo}/statuses/#{sha}",
        state: 'success',
        description: "Assembly account linked"
    end
  end
end