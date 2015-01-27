class ChangeShowcasesForNewAppsPage < ActiveRecord::Migration
  def change
    drop_table :showcases
    create_table :showcases, id: :uuid do |t|
      t.datetime :created_at,   null: false
      t.string   :slug,         null: false
      t.datetime :ended_at

      t.index :ended_at
    end

    Showcase.create!(slug: 'logos')
    Showcase.create!(slug: 'growth')
  end
end
