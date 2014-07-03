class CoreTeamMembersController < ProductController

  def index
    authenticate_user!
    find_product!

    @memberships = @product.team_memberships.active.core_team
    @core_team_memberships = @product.core_team_memberships

    @selected_filter = params[:filter]
  end

  def create
    authenticate_user!
    find_product!
    authorize! :edit, @product

    user = User.find_by_username(core_team_member_params.fetch(:username))
    if user
      @product.core_team << user

      # FIXME: Shouldn't have to #find_or_create both the TeamMembership and the CoreTeamMembership
      user.team_memberships.find_or_create_by!(product: @product).update_attributes(is_core: true)
      CoreTeamMembership.find_or_create_by!(product: @product, user: user)

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
