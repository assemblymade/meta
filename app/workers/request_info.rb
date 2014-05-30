class RequestInfo
  include Sidekiq::Worker

  def perform(user_id, at, product_id=nil)
    user = User.find(user_id)

    update = {
      last_request_at: at,
    }
    if product_id
      update[:recent_product_ids] = user.recent_product_ids || []
      update[:recent_product_ids].unshift(product_id).uniq
    end

    user.update_columns(update)
  end
end

