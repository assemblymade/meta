class IndexLabels < ActiveRecord::Migration
  def change
    add_index  :wips, :labels, using: 'gin'
  end
end
