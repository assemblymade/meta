class AddAuthorTipToWips < ActiveRecord::Migration
  def change
    add_column :wips, :author_tip, :decimal, null: false, default: 0

    # set tip on open wips
    Task.open.update_all author_tip: Task::AUTHOR_TIP
  end
end
