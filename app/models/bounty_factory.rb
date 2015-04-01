class BountyFactory
  def generate_bounty(product, author, description, title, value, order=nil, assignee=nil)
    wip = product.tasks.create({product: product, user: author, description: description, title: title, display_order: order, value: value})
    NewsFeedItem.create_with_target(wip)

    if wip.valid?
      @activity = Activities::Post.publish!(
        actor: author,
        subject: wip,
        target: product
      )
    end

    if assignee
      wip.start_work!(assignee)
    end
  end
end
