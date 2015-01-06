class Webhooks::ReadRaptorController < WebhookController

  def immediate
    user = User.find(params["user"])

    # by default, readraptor will send us every unread item a user has.
    # we're going to ignore all of them except the one we're interested in
    if entity = find_entity(params['entity_id'])
      if entity.try(:user).try(:flagged_at).nil?
        entity.notify_by_email(user)
        Rails.logger.info "readraptor_notify key=#{params["pending"]} user=#{user.username} entity=#{entity.id}"
      end
    end

    render nothing: true, status: 200
  end

  def find_entity(entity_id)
    # we should ignore any tags, the main content article has no tag
    if args = (params["pending"] || []).map{|id| id.split('_') }.find{|_, id, tag| id == entity_id && tag.nil? }
      args[0].constantize.find(args[1]) rescue nil
    end
  end
end
