class DomainMailer < BaseMailer
  def transfer_failed(domain_id)
    @domain = Domain.find(domain_id)
    @user = @domain.user
    @product = @domain.product

    mail      to: @user.email_address,
             bcc: 'dave@assembly.com',
         subject: "The domain #{@domain.name} failed to transfer to Assembly"
  end
end
