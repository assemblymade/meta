module ProductsHelper

  %w(
    assets
    products
    partners
    milestones
    activity
    chat
    dashboard
    discussions
    tasks
    jobs
    posts
  ).each do |name|
    define_method("#{name}_controller?") { controller_name == name }
  end

  def product_code_wips_path(product)
    product_wips_path(product, deliverable: :code)
  end

  def product_copy_wips_path(product)
    product_wips_path(product, deliverable: :copy)
  end

  def product_design_wips_path(product)
    product_wips_path(product, deliverable: :design)
  end

end
