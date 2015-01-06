class CoreTeamMembersController < ProductController
  def create
    authenticate_user!
    find_product!
    authorize! :edit, @product

    user = User.find_by_username(core_team_member_params.fetch(:username))
    if user
      team_membership = user.team_memberships.find_by(product: @product)

      if team_membership.nil?
        user.team_memberships.create(product: @product, is_core: true)
      else
        team_membership.update_attributes(is_core: true)
      end

      if user.flagged_at.nil?
        CoreTeamMailer.delay(queue: 'mailer').welcome(@product.id, user.id)

        Activities::CreateCoreTeamMembership.publish!(
          actor: user,
          target: @product,
          subject: @product
        )
      end

      if user.has_github_account?
        (@product.repos || []).each do |repo|
          Github::AddCollaboratorToProductRepoWorker.perform_async(
            repo.url,
            user.github_login
          )
        end
      end
    end

    redirect_to edit_product_path(@product)
  end

  def core_team_member_params
    params.require(:core_team_member).permit(:username)
  end

end
