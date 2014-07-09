class AddLaunchedAtToProducts < ActiveRecord::Migration
  def change
    add_column :products, :launched_at, :datetime

    launched = %w(
      asm
      barrtr
      be-stow
      buckets
      coderwall
      confy
      dawn
      family-table
      firesize
      helpful
      meta
      present
      readraptor
      really-good-emails
      sharebay
      wivern
    )

    Product.where(slug: launched).update_all launched_at: Time.now
  end
end
