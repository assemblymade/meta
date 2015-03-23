class BountyFactory
  def generate_bounty(product, author, description, title, value)
    wip = product.tasks.create({})
    NewsFeedItem.create_with_target(wip)

    if bounty.valid?
      offer = bounty.offers.create(user: author, amount: value, ip: IPAddr.new('127.0.0.1'))

      @activity = Activities::Post.publish!(
        actor: author,
        subject: bounty,
        target: product
      )
    end
    bounty.update!({description: description, title: title})
  end
end
