class BountyFactory
  def generate_bounty(product, author, description, title, value, order=nil)
    wip = product.tasks.create({product: product, user: author, description: description, title: title, display_order: order})
    NewsFeedItem.create_with_target(wip)

    if wip.valid?
      offer = wip.offers.create(user: author, amount: value, ip: IPAddr.new('127.0.0.1'))

      @activity = Activities::Post.publish!(
        actor: author,
        subject: wip,
        target: product
      )
    end
  end
end
