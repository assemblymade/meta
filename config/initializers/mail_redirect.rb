if ENV['MAIL_REDIRECT']
  class Hook
    def self.delivering_email(message)
      message.subject = "[Redirect #{message.to.first}] #{message.subject}"
      message.to = ENV['MAIL_REDIRECT']
    end
  end

  ActionMailer::Base.register_interceptor(Hook)
end