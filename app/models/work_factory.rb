class WorkFactory
  def self.create_with_transaction_entry!(attributes)
    Work.transaction do
      Work.create!(attributes).tap do |work|
        if !work.user.nil?
          StreamEvent.add_work_event!(actor: work.user, subject: work, target: work.product)
        end
      end
    end
  end
end
