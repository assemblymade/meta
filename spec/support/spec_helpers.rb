module SpecHelpers
  def mint_coins(product, user, coins)
    TransactionLogEntry.minted!(nil, Time.now, product, user.id, coins)
  end

  def expect_mail_queued(mailer, method, *args)
    expect(
      Sidekiq::Extensions::DelayedMailer
    ).to have_enqueued_job(YAML.dump([mailer, method, args]))
  end
end
