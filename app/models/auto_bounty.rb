class AutoBounty

  def product_initial_bounties(product)
    introduce_yourself_bounty(product)
    product_roadmap(product)
  end

  def introduce_yourself_bounty(product)
    description = "Introduce yourself on #{product.name}.  What do you want to work on?  What are your skills and interests?  What are your thoughts about the product?"
    title = "Introduce yourself to the team"
    value = 10
    make_bounty(product, description, title, value)
  end

  def product_roadmap(product)
    description = "What do you need to build or validate your idea?  Set a timeframe releasing a first prototype of the product.  Give people specific milestones.  It's ok if these change later.  This is a guide for collaborators to keep their eye on the prize.  Publish this roadmap in a post."
    title = "Create a Product Roadmap"
    value = 10000
    make_bounty(product, description, title, value)
  end

  def make_bounty(product, description, title, value)
    kernel = User.find_by(username: "kernel")
    if kernel
      author = kernel
      BountyFactory.new.generate_bounty(product, author, description, title, value)
    end
  end

end
