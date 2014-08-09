class WorkFactory
  def self.create_with_transaction_entry!(attributes)
    Work.transaction do
      Work.create!(attributes).tap do |work|
        if !work.user.nil?
          # TransactionLogEntry.validated!(work.created_at, work.product, work.id, work.user.id, work.user.id)
          StreamEvent.add_work_event!(actor: work.user, subject: work, target: work.product)
        end
      end
    end
  end
end
