class RequestInfo
  include Sidekiq::Worker

  def perform(user_id, at, product_id=nil)
    user = User.find_by(id: user_id)
    return if user.nil?

    update = {
      last_request_at: at,
    }

    recent_product_ids = user.recent_product_ids || []

    if product_id && product_id != recent_product_ids.first
      update[:recent_product_ids] = (user.recent_product_ids || []).unshift(product_id).uniq.take(10)
    end

    user.update_columns(update)
  end
end
