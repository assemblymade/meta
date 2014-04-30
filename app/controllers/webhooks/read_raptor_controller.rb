class Webhooks::ReadRaptorController < WebhookController

  def immediate
    user = User.find(params["user"])

    entities.each do |entity|
      entity.notify_user! user
    end

    render nothing: true, status: 200
  end

  def entities
    (params["pending"] || []).map{|id| id.split('_') }.map do |type, id|
      type.constantize.find(id)
    end
  end
end
