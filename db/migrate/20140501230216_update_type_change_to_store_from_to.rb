class UpdateTypeChangeToStoreFromTo < ActiveRecord::Migration
  def change
    ActiveRecord::Base.connection.execute(
      "update events set body='" + {from:'Discussion', to:'Task'}.to_json + "' where type='Event::TypeChange' and body='Discussion'")
    ActiveRecord::Base.connection.execute(
      "update events set body='" + {from:'Task', to:'Discussion'}.to_json + "' where type='Event::TypeChange' and body='Task'")
  end
end
