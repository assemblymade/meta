class CreateInterestsFromArchetypes < ActiveRecord::Migration
  def change
    change_table :users do |t|
      t.string :interested_tags, array: true, default: '{}'
      t.string :most_important_quality
      t.string :how_much_time
      t.text   :previous_experience
      t.string :platforms, array: true, default: '{}'
    end

    %w(growth code design strategy).each do |archetype|
      User.where(archetype: archetype)
          .update_all(interested_tags: "{#{archetype}}")
    end

  end
end
