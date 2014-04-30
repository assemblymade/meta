class CreateIdeas < ActiveRecord::Migration
  def change
    create_table :ideas, id: false do |t|
      t.primary_key :id, :uuid, default: nil
      t.string      :slug
      t.string      :name, null: false
      t.string      :pitch
      t.text        :description
      t.datetime    :submitted_at
      t.datetime    :evaluated_at
      t.boolean     :is_approved
      t.integer     :presale_amount
      t.text        :presale_description
      t.integer     :assembly_contribution, default: 0, null: false
      t.timestamps
    end
  end
end
