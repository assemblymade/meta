class UpdateCoreTeamEmailForwards
  include Sidekiq::Worker

  def perform(product_id)
    if @product = Product.find(product_id)
      @product.domains.each do |domain|
        expression = %Q{match_recipient(".*@#{domain.name}")}
        data, status = mailgun.get('/routes')
        next if data['items'].find{|r| r['expression'] == expression}

        actions = []
        @product.core_team.pluck(:email).each do |e|
          actions << %Q{forward("#{e}")}
        end
        actions << "stop()"

        mailgun.post('/routes',
          description: "Forwarding for #{@product.slug} core team",
          expression: expression,
          action: actions
        )
      end
    end
  end

  def mailgun
    Mailgun::Client.new
  end

end
