class RequestInfo < ActiveJob::Base
  queue_as :default

  def perform(user_id, at, product_id=nil)
    user = User.find(user_id)

    update = {
      last_request_at: Time.at(at),
    }

    recent_product_ids = user.recent_product_ids || []

    if product_id && product_id != recent_product_ids.first
      update[:recent_product_ids] = (user.recent_product_ids || []).unshift(product_id).uniq.take(10)
    end

    user.update_columns(update)
  end
end
