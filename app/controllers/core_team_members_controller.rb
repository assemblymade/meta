class CoreTeamMembersController < ProductController

  def index
    authenticate_user!
    find_product!

    @core_team_memberships = @product.team_memberships.active.core_team

    @selected_filter = params[:filter]
  end

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

      CoreTeamMailer.delay(queue: 'mailer').welcome(@product.id, user.id)

      Activities::CreateCoreTeamMembership.publish!(
        actor: user,
        target: @product,
        subject: @product
      )

      if user.has_github_account?
        Github::AddCollaboratorToProductRepoWorker.perform_async(
          @product.slug,
          user.github_login
        )
      end
    end

    redirect_to edit_product_path(@product)
  end

  def core_team_member_params
    params.require(:core_team_member).permit(:username)
  end

end
