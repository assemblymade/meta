class MergeAllDiscussionsTogether < ActiveRecord::Migration
  def change
    add_column :products, :main_thread_id, :uuid

    Product.find_each do |product|
      product.with_lock do
        if discussion = product.discussions.find_by(number: 0)
          discussion.events.destroy_all
          discussion.destroy
        end

        main_thread = product.discussions.order(:events_count).last ||
                      product.discussions.create!(title: 'Introduce yourself', user: product.user, number: 0)

        product.update_attributes main_thread_id: main_thread.id
      end
    end
  end
end
