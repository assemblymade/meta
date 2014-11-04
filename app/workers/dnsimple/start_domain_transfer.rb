module Dnsimple
  class StartDomainTransfer
    include Client
    include Sidekiq::Worker

    def perform(domain_id)
      domain = Domain.find(domain_id)

      body, status = start_transfer(domain)

      if status == 200
        domain.transfer_initiated!
      else
        domain.transfer_failed!(body['message'])
      end
    end

    def start_transfer(domain)
      post('/domain_transfers',
              domain: {
                name: domain.name,
                registrant_id: ENV['DNSIMPLE_REGISTRANT_ID']
              },
              transfer_order: {
                authinfo: domain.transfer_auth_code
              }
            )
    end
  end
end
