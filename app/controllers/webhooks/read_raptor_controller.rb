class Webhooks::ReadRaptorController < WebhookController

  def immediate
    user = User.find(params["user"])

    entities.each do |entity|
      entity.notify_by_email(user)
    end

    render nothing: true, status: 200
  end

  def entities
    (params["pending"] || []).map{|id| id.split('_') }.map do |type, id, tag|
      # we should ignore any tags, the main content article has no tag
      type.constantize.find(id) if tag.nil?
    end.compact
  end
end
