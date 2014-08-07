class WipFactory
  def self.create(product, scope, creator, remote_ip, params, description=nil)
    new(product, scope, creator, remote_ip, params, description).create
  end

  def initialize(product, scope, creator, remote_ip, params, description)
    @product = product
    @scope = scope
    @creator = creator
    @remote_ip = remote_ip
    @params = params
    @description = description
  end

  def create
    wip = @scope.create(@params.merge(user: @creator))

    if wip.valid?
      add_description(wip)
      add_transaction_log_entry(wip)

      upvote_creator(wip) if wip.upvotable?
      watch_product

      users = @product.watchings.where(subscription: true).map(&:user)

      watch_wip(wip, users)
      register_with_readraptor(wip, users)
      push(wip, users)
    end

    wip
  end

  def add_description(wip)
    unless @description.blank?
      wip.update_attributes(description: @description)
    end
  end

  def upvote_creator(wip)
    wip.upvote!(@creator, @remote_ip)
  end

  def watch_wip(wip, users)
    users.each do |u|
      wip.auto_watch!(u)
    end
  end

  def watch_product
    @product.watch!(@creator)
  end

  def register_with_readraptor(wip, users)
    RegisterArticleWithRecipients.perform_async(
      users.map(&:id),
      [nil, :email, :chat],
      Wip,
      wip.id
    )
  end

  def add_transaction_log_entry(wip)
    TransactionLogEntry.proposed!(wip.created_at, @product, wip.id, @creator.id)
  end

  def push(wip, users)
    channels = users.map{|u| "@#{u.username}"} + [@product.push_channel]
    PusherWorker.perform_async channels, 'wip.created', WipSerializer.new(wip).to_json
  end
end
