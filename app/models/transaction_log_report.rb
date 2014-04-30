require 'csv'

class TransactionLogReport
  def initialize(entries)
    @entries = entries
  end

  def to_csv
    CSV.generate do |csv|
      csv << ["Time", "Action", "Work", "Author", "Value"]
      @entries.each do |entry|
        csv << [entry.created_at.iso8601, entry.work_id, entry.user_id, entry.action, entry.value]
      end
    end
  end
end