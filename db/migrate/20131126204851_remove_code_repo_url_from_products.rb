class RemoveCodeRepoUrlFromProducts < ActiveRecord::Migration
  def change
    change_table :products do |t|
      t.remove :code_repo_url
    end
  end
end
