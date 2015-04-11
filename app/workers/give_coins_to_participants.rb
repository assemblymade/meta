class GiveCoinsToParticipants
  def perform(chosen_participant_ids, product_id, coins_each=10)
    product = Product.find(product_id)
    author = product.user

    receiver_ids = chosen_participant_ids | [author.id]
    receivers = User.where(id: receiver_ids)

    idea = Idea.find_by!(product_id: product_id)

    title = "Participate in the Idea stage of #{product.name}"
    bounty = BountyFactory.new.generate_bounty(
      product,
      author,
      description=nil,
      title,
      coins_each
    )

    receivers.each do |user|
      bounty.award_with_reason(
        author,
        user,
        "For participating in the idea"
      )
    end

    bounty.close!(author)

    product.update_partners_count_cache
    product.save!
  end
end
