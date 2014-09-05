class LinkGithubAccount
  def initialize(user, uid, login)
    @user = user
    @uid = uid
    @login = login
  end

  def perform
    @user.update_attributes github_uid: @uid, github_login: @login

    @user.core_team_memberships.each do |membership|
      membership.product.repos.each do |repo|
        Github::AddCollaboratorToProductRepoWorker.perform_async(repo.full_name, @login)
      end
    end
  end
end

