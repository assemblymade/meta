class AddExtraToInvites < ActiveRecord::Migration
  def change
    add_column :invites, :extra, :hstore
  end
end
