class AddCodeRepo < ActiveRecord::Migration
  def up
    add_column :products, :code_repo_url, :string
    execute "UPDATE products SET code_repo_url = 'https://github.com/support-foo' WHERE slug = 'support-foo'"
  end
  
  def down
    remove_column :products, :code_repo_url
  end
end
