class CreateDailyActives < ActiveRecord::Migration
  def change
    create_table :daily_actives, id: :uuid do |t|
      t.integer :count
      t.datetime :created_at
    end
  end
end
