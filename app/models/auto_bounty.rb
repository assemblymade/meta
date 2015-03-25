class AutoBounty

  def introduce_yourself_bounty(product)
    description = "Introduce yourself on #{product.name}.  What do you want to work on?  What are your skills and interests?  What are your thoughts about the product?"
    title = "Introduce yourself to the team"
    value = 10
    make_bounty(product, description, title, value, false)
  end

  def role_roster(product)
    title = "Set up Role Roster"
    description = "Create bounties for existing or potential roles. They don't have to be binding and should be titular descriptions of different kinds of responsibility. Well crafted  bounties describe both the role's purpose and the accountabilities. This how you build a team."
    value = 5000
    make_bounty(product, description, title, value, true)
  end

  def assign_roles(product)
    title = "Assign Roles"
    description = "Find and assign people to the roles that were created in the role roster.  This isn't easy, you need to find people that you're going to work well with. Think about contacting past co-workers or friends."
    value = 5000
    make_bounty(product, description, title, value, true)
  end

  def product_roadmap(product)
    description = "What do you need to build or validate your idea?  Set a timeframe releasing a first prototype of the product.  Give people specific milestones.  It's ok if these change later.  This is a guide for collaborators to keep their eye on the prize.  Publish this roadmap in a post."
    title = "Create a Product Roadmap"
    value = 10000
    make_bounty(product, description, title, value, true)
  end

  def make_bounty(product, description, title, value, ordered)
    kernel = User.find_by(username: "kernel")
    if kernel
      author = kernel
      BountyFactory.new.generate_bounty(product, author, description, title, value, ordered)
    end
  end

  def product_initial_bounties(product)
    introduce_yourself_bounty(product)
    product_roadmap(product)
    role_roster(product)
    assign_roles(product)
  end


end
