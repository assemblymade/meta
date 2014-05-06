class UserMailerPreview < ActionMailer::Preview

  def welcome
    UserMailer.welcome(User.sample.id)
  end

  def reset_password_instructions
    UserMailer.reset_password_instructions(User.where('reset_password_token is not null').random.first)
  end

  def follow_up
    UserMailer.follow_up(User.sample)
  end

  def remind_user_of_their_claimed_work
    worker = Wip::Worker.sample
    if worker.nil?
      worker = Time.travel(1.week.ago) do
        wip = Wip.sample
        wip.start_work!(User.sample)
      end
    end
    UserMailer.remind_user_of_their_claimed_work(worker.user.id, worker.wip.id)
  end
  
end
