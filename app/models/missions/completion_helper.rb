module Missions
  module CompletionHelper
    def next_mission_if_complete!(mission, completor)
      if mission && mission.complete?
        flash[:mission_completed] = I18n.t "missions.#{mission.id}.name"
        if !current_user.staff?
          track_event 'mission.completed', ProductAnalyticsSerializer.new(@product).as_json
        end
        mission.complete!(completor)
      end
    end
  end
end
