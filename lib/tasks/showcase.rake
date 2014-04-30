namespace :showcases do

  task :email => ['showcases:emails:announcement', 'showcases:emails:reminder']

  namespace :emails do
    task :announcement => :environment do
      # Showcases starting today
      showcases = Showcase.today.where(email_public_sent_at: nil)

      showcases.each do |showcase|
        ShowcaseMailer.delay.product_is_featured(showcase.id)
        showcase.touch(:email_public_sent_at)
      end
    end

    task :reminder => :environment do
      # send reminder emails if one hasn't been sent and it's going to be
      # featured in the next 7 days
      start_time = 1.day.from_now
      end_time = start_time.advance(weeks: 1)

      showcases = Showcase
        .showcasing_in_date_range(start_time, end_time)
        .where(email_upcoming_sent_at: nil, email_public_sent_at: nil)

      showcases.each do |showcase|
        ShowcaseMailer.delay.product_soon_to_be_featured(showcase.id)
        showcase.touch(:email_upcoming_sent_at)
      end
    end
  end

end
