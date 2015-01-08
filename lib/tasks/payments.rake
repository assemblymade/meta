namespace :payments do
  desc "Report withholdings"
  task :withheld => :environment do
    require 'csv'

    csv = CSV.generate do |csv|
      csv << ['Requested At', 'Paid At', 'Username', 'Email', 'Total Requested', 'Amount Withheld', 'Amount Paid']
      User::Withdrawal.paid.where('amount_withheld > 0').order(:created_at).each do |w|
        csv << [
          w.created_at.iso8601,
          w.payment_sent_at.iso8601,
          w.user.username,
          w.user.email,
          w.total_amount,
          w.amount_withheld,
          w.total_amount - w.amount_withheld
        ]
      end
    end

    puts csv
  end
end
