class BountyFactory
  def generate_bounty(product, author, description, title, value, ordered)
    if ordered
      last_ordered_task = product.tasks.select{ |a| a.display_order }.sort_by{|b| -b.display_order}.last
      if last_ordered_task
        order = last_ordered_task.display_order + 1
      else
        order = 0
      end
    else
      order = nil
    end

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
