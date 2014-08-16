namespace :reporting do
  desc "Generate user balances from Profit Reports"
  task :users => :environment do
    ProfitReport.all.each do |report|
      puts "#{report.end_at} #{report.product.slug} #{report.coins} earnable:$#{"%.02f" % (report.earnable / 100.0)}  fee:$#{"%.02f" % (report.fee / 100.0)}"
      next if report.user_balances.any?

      total_coins = 0
      total_percentage = 0
      total_earnings = 0
      non_staff_earnings = 0

      wallets = TransactionLogEntry.to_month_end(report.end_at).where(product_id: report.product_id).with_cents.group(:wallet_id).sum(:cents)
      User.where(id: wallets.keys).each do |user|
        user_coins = wallets[user.id]
        percentage = wallets[user.id] / report.coins.to_f
        earnings = (percentage * report.earnable).round
        puts "  #{user.username.ljust(25)} #{user_coins.to_s.rjust(10)} (#{("%.02f" % (percentage * 100)).rjust(5)}%)    $#{("%.02f" % (earnings / 100.0)).rjust(10)}  #{'staff' if user.staff?}"

        report.user_balances.create!(user: user, coins: user_coins, earnings: earnings)

        total_coins += user_coins
        total_percentage += percentage
        total_earnings += earnings
        non_staff_earnings += earnings unless user.staff?
      end

      puts "      total coins: #{total_coins} (#{total_percentage * 100}%)  total earnings: $#{"%.02f" % (total_earnings / 100.0)}  non staff: $#{"%.02f" % (non_staff_earnings / 100.0)}"
    end
  end
end
