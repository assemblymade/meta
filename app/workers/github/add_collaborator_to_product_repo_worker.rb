module Github
  class AddCollaboratorToProductRepoWorker < Github::Worker
    def perform(repo_url, github_username)
      return unless org

      repo = Repo::Github.new(repo_url)
      username = github_username

      team = find_or_create_repo_team(repo)
      add_user_to_team(team['id'], username)
      add_team_to_repo(team['id'], repo)
    end

    def find_or_create_repo_team(repo)
      find_repo_team(repo) || create_repo_team(repo)
    end

    def find_repo_team(repo)
      get("/repos/#{repo.full_name}/teams").find{|team| team['name'] == repo.name rescue false }
    end

    def create_repo_team(repo)
      post "/orgs/#{org}/teams",
                name: repo.name,
                repo_names: [repo.name],
                permission: 'push'

      repo.name
    end

    def add_user_to_team(team_id, github_username)
      put "/teams/#{team_id}/memberships/#{github_username}"
    end

    def add_team_to_repo(team_id, repo)
      put "/teams/#{team_id}/repos/#{org}/#{repo.name}"
    end

    def org
      ENV['GITHUB_PRODUCTS_ORG']
    end
  end
end
