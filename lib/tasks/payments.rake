namespace :payments do
  desc "Report withholdings"
  task :withheld => :environment do
    require 'csv'

    csv = CSV.generate do |csv|
      csv << ['Requested At', 'Paid At', 'Username', 'Email', 'Total Requested', 'Amount Withheld', 'Amount Paid']
      User::Withdrawal.paid.order(:created_at).each do |w|
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

  desc "Report tax information"
  task :tax_info => :environment do
    require 'csv'

    csv = CSV.generate do |csv|
      csv << [
        'Full Name',
        'Form Type',
        'Business Name',
        'Tax ID',
        'Taxpayer Type',
        'Classification',
        'Address',
        'City',
        'State',
        'Zip',
        'Country',
        'Foreign Tax ID',
        'Reference Number',
        'Date of Birth',
        'Signatory',
        'Citizenship',
        'Mailing Address',
        'Mailing City',
        'Mailing State',
        'Mailing Zip',
        'Mailing Country',
        'Treaty Article',
        'Treaty Withholding',
        'Treaty Income Type',
        'Treaty Reasons',
        'Signature Capacity',
      ]
      User.where(id: User::Withdrawal.paid.group(:user_id).pluck(:user_id)).joins(:tax_info).order('user_tax_infos.full_name').each do |user|
        i = user.tax_info
        csv << [
          i.full_name,
          i.type,
          i.business_name,
          i.taxpayer_id,
          i.taxpayer_type,
          i.classification,
          i.address,
          i.city,
          i.state,
          i.zip,
          i.country,
          i.foreign_tax_id,
          i.reference_number,
          i.date_of_birth,
          i.signatory,
          i.citizenship,
          i.mailing_address,
          i.mailing_city,
          i.mailing_state,
          i.mailing_zip,
          i.mailing_country,
          i.treaty_article,
          i.treaty_withholding,
          i.treaty_income_type,
          i.treaty_reasons,
          i.signature_capacity,
        ]
      end
    end

    puts csv
  end

end
