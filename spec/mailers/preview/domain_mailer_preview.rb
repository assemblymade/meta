class DomainMailerPreview < ActionMailer::Preview
  def transfer_failed
    domain = Domain.where.not(status: nil).sample
    
    DomainMailer.transfer_failed(domain.id)
  end
end