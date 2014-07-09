class RepositoriesController < ProductController
  before_action :find_product!

  respond_to :json, :html

  def create
    authorize! :update, @product

    if @product.repos.count >= 20
      flash[:notice] = "Whoa! You've created a lot of repositories! Slow down there, cowperson!"
      return redirect_to product_repos_path(@product)
    end

    repo_name = [@product.slug, repo_params].join('')

    Github::CreateProductRepoWorker.perform_async(
      @product.id,
      product_url(@product),
      repo_name
    )

    respond_with(@product, location: product_repos_path(@product))
  end

  def repo_params
    params.require(:repository).require(:name)
  end
end
