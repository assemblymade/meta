class AddNumberIndexToEvents < ActiveRecord::Migration
  def change
    Wip.find_each do |wip|
      i = 0
      wip.events.order(:created_at).each do |ev|
        i += 1
        ev.update_column :number, i
      end
    end

    add_index :events, [:wip_id, :number], unique: true
  end
end
