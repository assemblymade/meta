class CreateBounty < ApiWorker
  def perform(product_slug)
    @product = Product.find_by(slug: product_slug)
    @user = User.find_by(username: 'kernel')

    post Rails.application.routes.url_helpers.api_product_bounties_path(@product),
      task: {
        title: "Introduce yourself",
        amount: 100,
        description: "Introduce yourself to the team to earn you first app coins in the project. Tell everyone what you're good at, what you're looking to learn, and how you're excited to help. (It's up to the core team to make sure that introductions are properly awarded. @core: Just click \"Award this bounty to [awardee] and keep it open\" in the introduction's ellipsis dropdown.",
        tag_list: ["recurring"]
      }
  end
end
