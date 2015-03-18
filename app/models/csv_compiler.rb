class CsvCompiler

  def get_product_partner_breakdown(product, before_date=0.days.ago)
    entries = TransactionLogEntry.where(product_id: product.id).where('created_at < ?', before_date).with_cents.group(:wallet_id).sum(:cents)
    users = User.where(id: entries.keys).to_a
    user_ids = users.map(&:id)
    user_entries = []

    entries.each do |entry|
      if user_ids.index(entry[0])
        user_entry = [User.find(entry[0]).username, entry[1]]
        user_entries.append(user_entry)
      end
    end
    s = user_entries.sum{|c| c[1]}
    user_entries = user_entries.map{|a, b| [a, b.to_f/s.to_f * 100] }
    user_entries.sort_by{|a, b| -b}.select{|a, b| b>0}
  end

end
