class FillInOldActivities < ActiveRecord::Migration
  def change
    event_to_verb = {
      Event::Promotion => :promote,
      Event::Demotion => :demote,
      Event::Unallocation => :close,
      Event::Rejection => :reject,
      Event::Win => :award,
    }

    event_to_verb.keys.each do |event_type|
      event_type.all.each do |event|
        create_activity_by event.user, event_to_verb[event_type], event.wip, event.created_at
      end
    end
  end

  def create_activity_by(user, verb, target, created_at)
    parameters = {
      actor_id: user.id,
      actor_username: user.username,
      actor_avatar_url: user.decorate.avatar_url,
      verb: verb
    }

    if target.respond_to?(:activity_parameters)
      target_paramters = Hash[target.activity_parameters.map do |key, value|
        ["target_#{key}".to_sym, value]
      end]

      parameters.merge!(target_paramters)
    end

    if target.respond_to?(:activity_parameters)
      object_paramters = Hash[target.activity_parameters.map do |key, value|
        ["object_#{key}".to_sym, value]
      end]

      parameters.merge!(object_paramters)
    end

    activity_attrs = { owner: user, subject: target, key: verb, parameters: parameters, created_at: created_at }

    if target.respond_to?(:product)
      activity_attrs.merge!(product: target.product)
    end

    Activity.create!(activity_attrs)
  end
end
