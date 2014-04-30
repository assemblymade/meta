class AddFreePerkToProducts < ActiveRecord::Migration
  def up
    add_column :products, :free_perk, :text
    
    [
      ['support-foo',   '1 week unlimited trial'],
      ['party-box',     '1 week unlimited trial'],
      ['glass-juice',   '1 week trial'],
      ['housecall',     '$1 off first Handyman consultation'],
      ['calmail',       '1 week unlimited trial'],
      ['swear-jar',     'Free for 1 user'],
      ['splitty',       '2 free transactions'],
      ['amail',         '1 week unlimited trial'],
      ['raw-box',       '50 MB of storage'],
      ['hands-free-kitchen',  'Unlimited access to trial recipes for 1 week']
    ].each do |change|
      execute "UPDATE products SET free_perk = '#{change.last}' where slug = '#{change.first}'"
    end
  end
  
  def down
    remove_column :products, :free_perk
  end
  
end
