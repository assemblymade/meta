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
      upvote_creator(wip) if wip.upvotable?
      watch_product
      register_with_readraptor(wip)
      add_transaction_log_entry(wip)
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

  def watch_product
    @product.watch!(@creator)
  end

  def register_with_readraptor(wip)
    ReadRaptorDelivery.new(@product.watchers - [@creator]).deliver_async(wip)
  end

  def add_transaction_log_entry(wip)
    TransactionLogEntry.proposed!(wip.created_at, @product, wip.id, @creator.id)
  end
end