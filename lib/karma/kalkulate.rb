module Karma
  class Kalkulate

  FOUNDER_BOUNTY_MULTIPLER = 1.0

  def karma_from_product_founding(product)
    kumulative_karma = 1.0  #starting karma
    founder = User.find_by(product.user_id)
    product_bounties_n = product.tasks.won.count
    kumulative_karma = kumulative_karma + FOUNDER_BOUNTY_MULTIPLER * product_bounties_n
    return kumulative_karma
  end


  def karma_from_bounty_creation_after_completion(product)

  end

  def karma_from_bounty_completion()
  end

  def award_for_product_to_stealth(product)
    karma_value = 1.0
    user_id = product.user_id

    chronicle = Chronicle.find_by(user_id: user_id)
    if not chronicle.nil?
      chronicle_id = chronicle.id
    else
      chronicle = Chronicle.create!(user_id: user_id)
      chronicle_id = chronicle.id
    end
    puts "Creating Deed for Product Creation"
    Deed.create!({karma_value: karma_value, karma_event: product, user_id: user_id, chronicle_id: chronicle_id})
  end


  end
end
