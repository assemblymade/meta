class RenameWipsToDiscussions < ActiveRecord::Migration
  def change
    add_column :wips, :type, :string

    Wip.update_all type: 'Task'
  end
end
