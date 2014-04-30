class CreateBroadcasts < ActiveRecord::Migration
  def change
    create_table :broadcasts, id: :uuid do |t|
      t.string   :subject
      t.text     :body
      t.datetime :published_at
      t.timestamps
    end
  end
end
