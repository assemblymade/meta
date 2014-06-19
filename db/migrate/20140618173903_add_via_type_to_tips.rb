class AddViaTypeToTips < ActiveRecord::Migration
  def change
    add_column :tips, :via_type, :string, null: false, default: 'Activity'

    Tip.all.each do |tip|
      event = Event.find(tip.via_id)
      if event.wip.main_thread?
        activity = Activity.find_by!(subject_id: event.id)

        tip.via = activity
        tip.save!
      end
    end

  end
end
