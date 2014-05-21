class MergeAllDiscussionsTogether < ActiveRecord::Migration
  def change
    add_column :products, :main_thread_id, :uuid

    active_product_ids = Discussion.where('events_count > 5').group(:product_id).count.keys

    Product.find_each do |product|
      product.with_lock do
        if discussion = product.discussions.find_by(number: 0)
          discussion.events.destroy_all
          discussion.destroy
        end

        main_thread = product.discussions.order(:events_count).last

        if main_thread && !active_product_ids.include?(product.id)
          # main_thread.update_attributes title: 'Introduce yourself'
          main_thread.comments.create(
            user: product.user,
            body: main_thread.title,
            created_at: product.created_at,
            updated_at: product.updated_at
          )
        else
          main_thread = product.discussions.create!(title: 'Introduce yourself', user: product.user, number: 0)
        end

        product.update_attributes main_thread_id: main_thread.id
      end

      product.with_lock do
        (product.watchers + product.votes.map(&:user)).uniq.compact.each do |watcher|
          product.main_thread.watch!(watcher)
        end
      end
    end
  end
end
