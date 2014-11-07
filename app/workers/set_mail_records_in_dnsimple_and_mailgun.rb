class SetMailRecordsInDnsimpleAndMailgun
  include Sidekiq::Worker

  def perform(domain_id)
    domain = Domain.find(domain_id)

    dns_records = get_dns_records(domain.name)
    mail_records = get_mail_records(domain.name)

    mail_records.each do |mail|
      dnsimple.post("/domains/#{domain.name}/records", record: {
        name: mail['name'] || '',
        record_type: mail['record_type'],
        content: mail['value'],
        prio: mail['priority']
      })
    end

    UpdateCoreTeamEmailForwards.perform_async(domain.product.id)

    domain.email_forwarding_added!
  end

  def get_dns_records(domain_name)
    data, status = dnsimple.get("/domains/#{domain_name}/records")
    raise 'Unhosted domain' if status == 404

    data.map{|r| r['record'] }
  end

  def get_mail_records(domain_name)
    data, status = mailgun.get "/domains/#{domain_name}"
    if status == 404
      data, status = mailgun.post '/domains', name: domain_name, wildcard: true
    end
    data['receiving_dns_records']
  end

  def dnsimple
    Dnsimple::Client.new
  end

  def mailgun
    Mailgun::Client.new
  end
end