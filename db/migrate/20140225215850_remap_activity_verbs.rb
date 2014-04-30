class RemapActivityVerbs < ActiveRecord::Migration
  def change
    Activity.all.each do |activity|
      parameters = activity.parameters

      verb = case parameters['verb']
      when 'commented', 'commented on' then 'comment'
      when 'created' then 'create'
      when 'reviewing' then 'review'
      when 'allocated' then 'allocate'
      else parameters['verb']
      end

      activity.parameters = parameters.merge('verb' => verb)
      activity.save!
    end
  end
end
