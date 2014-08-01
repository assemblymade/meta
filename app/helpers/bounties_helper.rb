module BountiesHelper

  def scoped_product_bounties_path(product, options={})
    state = options[:state] || params[:state]
    user = options[:user] || params[:user]
    sort = options[:sort] || params[:sort]
    project = options[:project] || params[:project]

    product_wips_path(product,
      state:   state,
      user:    user,
      sort:    sort,
      project: project
    )
  end

end
