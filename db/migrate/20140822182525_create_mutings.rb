class CreateMutings < ActiveRecord::Migration
  def up
    create_table :mutings, id: :uuid do |t|
      t.uuid :wip_id,  null: false
      t.uuid :user_id, null: false

      t.datetime :created_at, null: false
      t.datetime :deleted_at
    end

    muted_watchings = Watching.where('unwatched_at is not null').
                               where(watchable_type: Wip)

    muted_watchings.each do |w|
      Muting.create!(user: w.user, wip: w.watchable)
    end

    muted_watchings.destroy_all
  end

  def down
    drop_table :mutings
  end
end
