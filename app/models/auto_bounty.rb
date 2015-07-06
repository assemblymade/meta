class AutoBounty

  def founder_bounty(product)
    description = "Welcome!  You've started a new product.  Fantastic.  Here are some of the things you can do to get started. \n\n<b>Write a post</b> so partners know the gameplan.\n\n<b>Create some bounties</b> to show people how to help out.\n\nWe've also created some suggested bounties for you in the bounties tab.  Feel free to close them if you feel that they aren't relevant.\n\nLast but not least, <b>give yourself a little something</b>.  Write a comment and award yourself this bounty.  That means you get coins representing ownership.  You're the founder, you deserve a real say.  If there are any co-founders, award them this bounty too to credit their contribution."
    description = description + "\n\nSee the <a href=#{ProductSerializer.new(product).url}/partners>current ownership</a> on the partners page."
    value = 20000
    title = "First steps"
    make_bounty(product, description, title, value, 0, product.user)
  end

  def make_first_bounties(product)
    description = "Write your first bounties.  Whatever it is that this product needs first to get started, go ahead and write it down in a new bounty.  Even if it's something you are going to do yourself, write it down so you can award it later.  \n\nIn general, when writing a bounty, try to make it as clear as possible for a new user.  How does someone new to your product start helping today?  Write some bounties to get started."
    description = description + "\n\n<h5>Bounty Samples</h5> \n\n- <a href=https://cove.assembly.com/kanshu/bounties/146>Become Project Lead</a>\n\n- <a href=https://cove.assembly.com/runbook/bounties/292>Integrate with Mailchimp goals</a>\n\n- <a href=https://cove.assembly.com/gamamia/bounties/137>Find Free Indie Games</a>\n\n- <a href=https://cove.assembly.com/kanshu/bounties/102>Find Photos to use with App</a>"
    value = 2000
    title = "Write your first bounties"
    make_bounty(product, description, title, value, 1, product.user)
  end

  def write_first_post(product)
    description = "With the start of #{product.name}, it's time to write your first post.  Tell your partners about the kick off.  What do you have planned?  What's coming next?  How can everyone get started?"
    value = 2000
    title = "Update your partners about the launch"
    make_bounty(product, description, title, value, 2, product.user)
  end

  def role_roster(product)
    title = "Describe product roles"
    description = "Create bounties for existing or potential roles. They don't have to be binding and should be titular descriptions of different kinds of responsibility. Well crafted  bounties describe both the role's purpose and the accountabilities. This how you build a team."
    description = description + "\n\n<h5>Example Roles:</h5> \n\nTech Lead\n\nMarketing Chief\n\nDesign Guru\n\nFront End Wizard\n\nBackend Master\n\nNameless Developer Henchman\n\nCopy Writer Extraordinaire"
    value = 5000
    make_bounty(product, description, title, value, 3, product.user)
  end

  def make_logo(product)
    description = "Every product needs a logo, even a simple one.  Get a logo for your product as soon as possible.  It can be a placeholder for now.  But if it's cool, you'll certainly attract more attention."
    value = 5000
    title = "Choose a Logo"
    make_bounty(product, description, title, value, 4, product.user)
  end

  def introduce_yourself_bounty(product)
    description = "We're always looking for more team members on #{product.name}.  If you're interested in getting involved, in any capacity, please introduce yourself in the comments below.  Here are a few things you might want to mention:"
    description = description+"\n\n- What do you want to work on?\n\n- What are your skills and interests?\n\n- How would you like to be involved?\n\n- What else have you worked on?\n\n- What do you find compelling about #{product.name}?"
    title = "Introduce yourself to the team"
    value = 10
    make_bounty(product, description, title, value)
  end

  def write_contributor_guide(product)
    description = "A lot of products require complex instructions for how to get started.  Write a guide detailing, step-by-step, how a new contributor can start helping.  What should they do first?  Where should they go for ideas?  If it's a software product, how do they set up their development environment?  What special instructions are needed to get started?  Be detailed.  Be explicit.  Contributors need to know HOW and WHERE to start."
    value = 10000
    title = "Write Contributor Guide"
    make_bounty(product, description, title, value)
  end

  def make_someone_core(product)
    description = "Core team members are vested with enormous powers within a Product.  They can value and award bounties.  This gives them enormous influence over the total ownership distribution.  They can write posts for which the entire team is notified.  They guide and lead the team.  It's an incredibly important position."
    description = description + "\n\n  So it's especially important to pick someone excellent.  Pick someone you really trust.  Pick someone you respect to make the right choices in your absence.  Don't pick someone to be Core in a hurry.  If you're not sure, save this bounty for later."
    value = 5000
    title = "Find another Core Team Member"
    make_bounty(product, description, title , value)
  end

  def make_bounty(product, description, title, value, order=nil, assignee=nil)
    kernel = User.find_by(username: "kernel")
    if kernel
      author = kernel
      BountyFactory.new.generate_bounty(product, author, description, title, value, order, assignee)
    end
  end

  def product_initial_bounties(product)
    make_someone_core(product)
    introduce_yourself_bounty(product)
    role_roster(product)
    write_contributor_guide(product)
    make_first_bounties(product)
    founder_bounty(product)
    write_first_post(product)
    make_logo(product)
  end


end
