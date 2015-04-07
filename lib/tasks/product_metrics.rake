namespace :product_metrics do
  desc "Update product metrics from redshift"
  task update: :environment do
    UpdateProductMetrics.perform_async
  end

  desc "Monthly report of top product metrics"
  task monthly: :environment do
    numbers = MonthlyMetric.where(date: 1.month.ago.beginning_of_month.to_date).map do |m|
      prev = MonthlyMetric.find_by(date: 2.months.ago.beginning_of_month.to_date, product_id: m.product_id)
      [
        m.product.slug,
        m.total_accounts_override || m.total_accounts,
        m.uniques_override || m.ga_uniques,
        prev.try(:uniques_override) || prev.try(:ga_uniques)
      ]
    end

    require 'csv'
    csv = CSV.generate do |csv|
      csv << (["Product", "Total Accounts", "Uniques", "Previous"])
      numbers.sort_by{|_, t| -(t || 0) }.each do |row|
        csv << row
      end
    end
    pp_csv(csv)
    puts csv
  end

  def pp_csv(csv)
    cols = csv.split("\n").map{|r| r.split(",") }.each_with_object([]) {|row, a| row.each.with_index{|c, i| a[i] = c if c.to_s.size > a[i].to_s.size }}
    csv.split("\n").each{|row| $stderr.puts row.split(',').map.with_index{|col, i| col.ljust([cols[i].size, 7].max + 2) }.join }
  end
end
