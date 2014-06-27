class CoreTeamMembersController < ApplicationController

  def create
    authenticate_user!
    find_product!
    authorize! :edit, @product

    user = User.find_by_username(core_team_member_params.fetch(:username))
    if user
      @product.core_team << user
      CoreTeamMailer.delay(queue: 'mailer').welcome(@product.id, user.id)

      if user.has_github_account?
        Github::AddCollaboratorToProductRepoWorker.perform_async(
          @product.slug,
          user.github_login
        )
      end
    end

    redirect_to edit_product_path(@product)
  end

  def find_product!
    @product = Product.find_by_slug(params[:product_id])
  end

  def core_team_member_params
    params.require(:core_team_member).permit(:username)
  end

end
