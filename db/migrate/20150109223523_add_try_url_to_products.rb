class AddTryUrlToProducts < ActiveRecord::Migration
  def change
    add_column :products, :try_url, :text

    {
      'helpful'   => 'https://helpful.io',
      'coderwall' => 'https://coderwall.com',
      'runbook'   => 'https://runbook.io'
    }.each do |slug, url|
      Product.find_by!(slug: 'helpful').update!(try_url: 'https://helpful.io')
    end
  end
end
