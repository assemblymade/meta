class AutoBounty

  def introduce_yourself_bounty(product)
    description = "Introduce yourself on #{product.name}.  What do you want to work on?  What are your skills and interests?  What are your thoughts about the product?"
    title = "Introduce yourself to the team"
    value = 10
    make_bounty(product, description, title, value)
  end

  def role_roster(product)
    title = "Set up Role Roster"
    description = "Create bounties for existing or potential roles. They don't have to be binding and should be titular descriptions of different kinds of responsibility. Well crafted  bounties describe both the role's purpose and the accountabilities. This how you build a team."
    value = 5000
    make_bounty(product, description, title, value, 1)
  end

  def github_repo(product)
    title = "Create a Github Repo"
    description = "Most products will want to have a Github Repository.  It's a great resource for managing a team's contributions."
    value = 3000
    make_bounty(product, description, title, value)
  end

  def assign_roles(product)
    title = "Assign Roles"
    description = "Find and assign people to the roles that were created in the role roster.  This isn't easy, you need to find people that you're going to work well with. Think about contacting past co-workers or friends."
    value = 5000
    make_bounty(product, description, title, value, 2)
  end

  def product_roadmap(product)
    description = "What do you need to build or validate your idea?  Set a timeframe releasing a first prototype of the product.  Give people specific milestones.  It's ok if these change later.  This is a guide for collaborators to keep their eye on the prize.  Publish this roadmap in a post."
    title = "Create a Product Roadmap"
    value = 10000
    make_bounty(product, description, title, value, 0)
  end

  def make_logo(product)
    description = ""
    value =
    title = "Make a Logo"
    make_bounty(product, description, title, value)
  end

  def make_first_bounties(product)
    description = ""
    value =
    title = "Make a Logo"
    make_bounty(product, description, title, value)
  end

  def write_contributor_guide(product)
    description = ""
    value =
    title = "Make a Logo"
    make_bounty(product, description, title, value)
  end

  def write_first_post(product)
    description = ""
    value =
    title = "Make a Logo"
    make_bounty(product, description, title, value)
  end

  def find_a_bug(product)
    description = ""
    value =
    title = "Make a Logo"
    make_bounty(product, description, title, value)
  end

  def create_product_twitter_handle(product)
  end

  def make_bounty(product, description, title, value, order=nil)
    kernel = User.find_by(username: "kernel")
    if kernel
      author = kernel
      BountyFactory.new.generate_bounty(product, author, description, title, value, order)
    end
  end

  def product_initial_bounties(product)
    introduce_yourself_bounty(product)
    product_roadmap(product)
    role_roster(product)
    github_repo(product)
    assign_roles(product)
  end


end
