class LabelsToTags < ActiveRecord::Migration
  def change
    create_table :wip_tags, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.string :name, null: false
      t.datetime :created_at
    end

    create_table :wip_taggings, id: false do |t|
      t.primary_key :id, :uuid, default: nil

      t.uuid :wip_tag_id, null: false
      t.uuid :wip_id,     null: false

      t.datetime :created_at
    end

    add_index :wip_tags, :name, unique: true

    Wip.find_each do |w|
      w.labels.each do |label|
        tag = Wip::Tag.find_or_create_by!(name: label)
        Wip::Tagging.create!(wip: w, tag: tag)
      end
    end

    remove_column :wips, :labels
  end
end
