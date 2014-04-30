module Github
  class AddCollaboratorToProductRepoWorker < Github::Worker
    def perform(repo_name, github_username)
      if org
        team = find_or_create_repo_team(repo_name)
        add_user_to_team(team['id'], github_username)
        add_team_to_repo(team['id'], repo_name)
      end
    end

    def find_or_create_repo_team(repo_name)
      find_repo_team(repo_name) || create_repo_team(repo_name)
    end

    def find_repo_team(repo_name)
      get("/orgs/#{org}/teams").find{|team| team['name'] == repo_name }
    end

    def create_repo_team(repo_name)
      post "/orgs/#{org}/teams",
                name: repo_name,
                repo_names: [repo_name],
                permission: 'push'
    end

    def add_user_to_team(team_id, github_username)
      put "/teams/#{team_id}/members/#{github_username}"
    end

    def add_team_to_repo(team_id, repo_name)
      put "/teams/#{team_id}/repos/#{org}/#{repo_name}"
    end

    def org
      ENV['GITHUB_PRODUCTS_ORG']
    end
  end
end
