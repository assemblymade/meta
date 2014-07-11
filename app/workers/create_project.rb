class CreateProject < ApiWorker
  def perform(product_slug)
    @product = Product.find_by(slug: product_slug)

    return false unless Activity.where(target_id: @product.id)
                                .where.not(type: 'Activities::Chat')
                                .where.not(type: 'Activities::FoundProduct')
                                .empty?

    @user = User.find_by(username: 'kernel')

    post Rails.application.routes.url_helpers.api_product_projects_path(@product),
      wip: {
        title: "Lazy Human Launch Checklist",
        milestone_attributes: {
          description: "A robot could do these in less than 12 nanoseconds. I suspect you'll take a bit longer."
        },
        milestone_tasks_attributes: [
          {
            title: "Complete Homepage copy"
          },
          {
            title: "Value proposition"
          },
          {
            title: "FAQ strategy"
          },
          {
            title: "Content strategy for blog"
          },
          {
            title: "Model potential revenue"
          },
          {
            title: "Set up blog"
          },
          {
            title: "Get SSL up"
          },
          {
            title: "Set up error logging"
          },
          {
            title: "Determine stats to track and set up stat tracking"
          },
          {
            title: "Set up 404 and error pages"
          },
          {
            title: "Make the first commit"
          }
        ]
      }
  end
end
