module BountiesHelper

  def scoped_product_bounties_path(product, options={})
    state = options[:state] || params[:state]
    user = options[:user] || params[:user]
    user_id = options[:user_id] || params[:user_id]
    sort = options[:sort] || params[:sort]
    project = options[:project] || params[:project]
    tag = options[:tag] || params[:tag]

    product_wips_path(product,
      state:   state,
      user:    user,
      user_id: user_id,
      sort:    sort,
      project: project,
      tag:     tag
    )
  end

end
