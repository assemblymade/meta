class AddTentativeNameToIdea < ActiveRecord::Migration
  def change
    add_column :ideas, :tentative_name, :string
  end
end
