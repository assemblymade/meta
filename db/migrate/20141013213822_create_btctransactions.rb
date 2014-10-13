class CreateBtctransactions < ActiveRecord::Migration
  def change
    create_table :btctransactions do |t|
      t.string :id
      t.boolean :success

      t.timestamps
    end
  end
end
