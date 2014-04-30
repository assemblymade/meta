class ProductRedirector
  attr_accessor :type

  def initialize(type = nil)
    self.type = type
  end

  def call(params, request)
    case type
    when :task
      task_path(params)
    when :discussion
      discussion_path(params)
    else
      product_path(params)
    end
  end

  def product_path(params)
    product = Product.find(params[:id])
    routes.product_path(product)
  end

  def task_path(params)
    product = Product.find(params[:product_id])
    task = product.tasks.find(params[:id])
    routes.product_wip_path(product, task)
  end

  def discussion_path(params)
    product = Product.find(params[:product_id])
    discussion = product.discussions.find(params[:id])
    routes.product_discussion_path(product, discussion)
  end

  def routes
    Rails.application.routes.url_helpers
  end
end
