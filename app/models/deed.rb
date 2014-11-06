class Deed < ActiveRecord::Base
  belongs_to :user
  belongs_to :karma_event, polymorphic: true

  # def self.create(type, karma_value, user_id, event_id)
  #   self.update!(id: SecureRandom.uuid, type: type, karma_value: karma_value, created_at: DateTime.now, event_entry_id: event_id)
  # end
end
