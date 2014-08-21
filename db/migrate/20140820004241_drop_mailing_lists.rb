class DropMailingLists < ActiveRecord::Migration
  def change
    drop_table :mailing_lists
  end
end
