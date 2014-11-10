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



  end
end
