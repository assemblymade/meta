class ChangeIdeaTopicsToAnArray < ActiveRecord::Migration
  def change
    add_column :ideas, :topics_tmp, :text, array: true, default: []

    Idea.reset_column_information
    Idea.find_each do |idea|
      idea.topics_tmp = idea.topics.keys.reject{ |key| idea.topics[key] == true }
      idea.save
    end

    remove_column :ideas, :topics
    rename_column :ideas, :topics_tmp, :topics
  end
end
