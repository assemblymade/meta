class UpdateActivityVerbToReferenceTarget < ActiveRecord::Migration
  def change
    Activity.all.each do |activity|
      new_key = activity.subject.is_a?(Event::Comment) ? 'commented on' : activity.key
      activity.key = new_key
      activity.parameters = activity.parameters.merge('verb' => new_key)
      activity.save!
    end
  end
end
