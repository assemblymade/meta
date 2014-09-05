class AddPrimaryKeyToEvents < ActiveRecord::Migration
  def up
    execute "ALTER TABLE events ADD PRIMARY KEY (id);"
  end

  def down
    execute "ALTER TABLE events DROP CONSTRAINT table_pkey;"
  end
end
