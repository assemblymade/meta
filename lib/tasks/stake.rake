namespace :stake do
  desc "Recalculate the stake for products"
  task :recalculate => :environment do
    raise "Deleting history is bad mmkay" unless Rails.env.development?
    ActiveRecord::Base.logger = nil

    Product.find_each do |product|
      Rails.logger.info "stake product:#{product.slug}"

      product.with_lock do
        TransactionLogEntry.where(product_id: product.id).delete_all

        Work.where(product: product).find_each do |work|
          if work.user_id
            TransactionLogEntry.validated!(work.created_at, product, work.id, work.user.id, work.user.id)
          # else
          #   TransactionLogEntry.proposed!(work.created_at, product, work.id, nil)
          end
        end

        Task.where(product: product).includes(:events).find_each do |task|
          TransactionLogEntry.proposed!(task.created_at, product, task.id, task.user.id)

          task.events.each do |event|
            case event
            when Event::Promotion
              TransactionLogEntry.multiplied!(task.created_at, product, task.id, event.user.id, 2)
            when Event::Demotion
              TransactionLogEntry.multiplied!(task.created_at, product, task.id, event.user.id, 1)
            when Event::Win
              TransactionLogEntry.validated!(task.created_at, product, task.id, event.user.id, event.winner.id)
            end
          end
        end

        Vote.joins('inner join wips on voteable_id = wips.id').
             where('wips.product_id = ?', product.id).
             where('wips.type = ?', Task).find_each do |vote|
          TransactionLogEntry.voted!(vote.created_at, product, vote.voteable_id, vote.user.id)
        end

        Vote.joins('inner join work on voteable_id = work.id').
             where('work.product_id = ?', product.id).find_each do |vote|
          TransactionLogEntry.voted!(vote.created_at, product, vote.voteable_id, vote.user.id)
        end

        Tip.where(product: product).each do |tip|
          tip.with_lock do
            transaction_id = SecureRandom.uuid
            TransactionLogEntry.create!(
              transaction_id: transaction_id,
              created_at: tip.created_at,
              product: tip.product,
              action: 'credit',
              work_id: tip.via_id,
              user_id: tip.to.id,
              cents: tip.cents
            )

            TransactionLogEntry.create!(
              transaction_id: transaction_id,
              created_at: tip.created_at,
              product: tip.product,
              action: 'debit',
              work_id: tip.via_id,
              user_id: tip.from.id,
              cents: (-1 * tip.cents)
            )
          end
        end
      end
    end
  end
end
