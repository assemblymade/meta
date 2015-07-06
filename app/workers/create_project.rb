class CreateProject < ApiWorker
  def perform(product_slug)
    @product = Product.find_by(slug: product_slug)
    @user = User.find_by(username: 'kernel')

    return false unless Activity.where(target_id: @product.id)
                                .where.not(type: 'Activities::Chat')
                                .where.not(type: 'Activities::Found')
                                .empty?

    post Rails.application.routes.url_helpers.api_product_projects_path(@product),
      wip: {
        title: "Launch Checklist",
        milestone_attributes: {
          description: "Hey @core team, I've created a short checklist to help kick off the project. Ping me if you need help!"
        },
        milestone_tasks_attributes: [
          {
            title: "Write the problem and value proposition",
            description: "Having a clear product vision is important will greatly help users in the community understand the product. This bounty is for writing down the goals and description of the project.\n - Visit #{Rails.application.routes.url_helpers.edit_product_path(@product)}\n - Write 1-3 sentences about the problem that the product aims to solve, and how it will solve the problem. Save this in the project description.\n - Fill out the Vision section for the product."
          },
          {
            title: "Choose the tech stack",
            description: "- Choose the language and frameworks to build the project with. \n - This should include the APIs, libraries, languages, and services that are needed.\n - See this bounty for an example of a completed bounty for scoping out the [tech stack](https://cove.assembly.com/pay-it-forward/bounties/1)"
          },
          {
            title: "Commit a README file to the repository",
            description: "This bounty will help new contributors get up to speed with the product and the tech stack. \n - Post a description of the tech stack and the required APIs, libraries, and other dependencies in a README.md file.\n - Commit this README.md file to the repository and push it up."
          }
        ]
      }
  end
end
