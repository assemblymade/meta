class AutoPost

  def generate_idea_product_transition_post(product)
    idea = Idea.find_by(product_id: product.id)
    if idea
      title = "#{product.name} just became a product"
      body = "The idea previously known as '#{idea.name}' has now become an Assembly product called #{product.name}.  After passing the necessary milestones, getting hearts and feedback from the community, and picking a name, #{product.user.username} took the fateful step of turning an idea into something more."
      body = body + "\n \n Now that #{product.name} is a product, there's loads to do ahead.  Bounties should be written.  Roles should be assigned.  Collaborators must be found.  A roadmap for the progress should be laid out.  There's a lot to do.  Let's roll up our sleeves and make it a reality."
      author = User.find_by(username: "kernel")

      post = Post.create!({author: author, product: product, body: body, title: title})

    end
  end

end
