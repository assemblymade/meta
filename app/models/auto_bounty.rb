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
    description = "Every product needs a logo.  Get a logo for your product as soon as possible.  It can be a placeholder for now.  But if it's cool, you'll certainly attract more attention."
    value = 5000
    title = "Make a Logo"
    make_bounty(product, description, title, value)
  end

  def make_first_bounties(product)
    description = "Write your first four bounties.  Whatever it is that this product needs first to get started, go ahead and write it down in a new bounty.  Even if it's something you are going to do yourself, write it down so you can award it later.  In general, when writing a bounty, try to make it as clear as possible for a new user.  How does someone new to your product start helping today?  Write four bounties to get started."
    value = 1000
    title = "Write your first four bounties"
    make_bounty(product, description, title, value, 5)
  end

  def write_contributor_guide(product)
    description = "A lot of products require complex instructions for how to get started.  Write a guide detailing, step-by-step, how a new contributor can start helping.  What should they do first?  Where should they go for ideas?  If it's a software product, how do they set up their development environment?  What special instructions are needed to get started?  Be detailed.  Be explicit.  Contributors need to know HOW and WHERE to start."
    value = 10000
    title = "Write Contributor Guide"
    make_bounty(product, description, title, value)
  end

  def write_first_post(product)
    description = "With the start of #{product.name}, it's time to write your first post.  Describe the purpose of #{product.name}, your goals, and perhaps who you are.  What do you want to get out of this.  Kick off the product with an introductory post."
    value = 2000
    title = "Write your first post"
    make_bounty(product, description, title, value, 4)
  end

  def find_a_bug(product)
    description = "Find a bug that hasn't already been found.  Then create a bounty to fix that bug.  Including screenshots and a precise description of how the bug happened, will be extra useful."
    value = 3000
    title = "Find a Bug"
    make_bounty(product, description, title, value)
  end

  def create_product_twitter_handle(product)
    description = "Creating a presence on Twitter is a great way to build an audience for the product.  Even if you're far from launching, it's not too soon to start telling people about #{product.name}."
    value = 2000
    title = "Set up a Twitter handle for the product"
  end

  def founder_bounty(product)
    description = "Distribute initial ownership to founders.  These should be the leading initiators of the idea.  Through ownership, they will be vested with a significant stake in the future of the product."
    value = 20000
    title = "Founder Coins"
    make_bounty(product, description, title, value, 3)
  end

  def make_someone_core(product)
    description = "Core team members are vested with enormous powers within a Product.  They can value and award bounties.  This gives them enormous influence over the total ownership distribution.  They can write posts for which the entire team is notified.  They guide and lead the team.  It's an incredibly important position."
    description = description + "  So it's especially important to pick someone excellent.  Pick someone you really trust.  Pick someone you respect to make the right choices in your absence.  Don't pick someone to be Core in a hurry.  If you're not sure, save this bounty for later."
    value = 5000
    title = "Find another Core Team Member"
    make_bounty(product, description, title , value)
  end

  def make_bounty(product, description, title, value, order=nil)
    kernel = User.find_by(username: "kernel")
    if kernel
      author = kernel
      BountyFactory.new.generate_bounty(product, author, description, title, value, order)
    end
  end

  def product_initial_bounties(product)
    make_someone_core(product)
    introduce_yourself_bounty(product)
    product_roadmap(product)
    role_roster(product)
    github_repo(product)
    write_contributor_guide(product)
    make_first_bounties(product)
    assign_roles(product)
    founder_bounty(product)
    create_product_twitter_handle(product)
    find_a_bug(product)
    write_first_post(product)
    make_logo(product)
  end


end
