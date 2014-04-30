module ProductsHelper

  ["products", "partners", "milestones", "activity", "dashboard", "discussions", "tasks", "jobs"].each do |name|
    define_method("#{name}_controller?") do
      controller_name == name
    end
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
