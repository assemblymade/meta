class WipFactory
  def self.create(product, scope, creator, remote_ip, params, comment=nil)
    new(product, scope, creator, remote_ip, params, comment).create
  end

  def initialize(product, scope, creator, remote_ip, params, comment)
    @product = product
    @scope = scope
    @creator = creator
    @remote_ip = remote_ip
    @params = params
    @comment = comment
  end

  def create
    wip = @scope.create(@params.merge(user: @creator))

    if wip.valid?
      add_description(wip)
      add_transaction_log_entry(wip)

      upvote_creator(wip) if wip.upvotable?
      watch_product(@product.watchings.where(subscription: true).map(&:user))

      users = @product.watchers - [@creator]

      register_with_readraptor(wip, users)
      push(wip, users)
    end

    wip
  end

  def add_description(wip)
    unless @comment.blank?
      wip.events << Event::Comment.new(
        user_id: @creator.id,
        body: @comment
      )
    end
  end

  def upvote_creator(wip)
    wip.upvote!(@creator, @remote_ip)
  end

  def watch_product(users)
    users.each do |u|
      @product.watch!(u)
    end

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
