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
      watch_product
      prioritize(wip)

      NewsFeedItem.create_with_target(wip)

      users = @product.followers

      if mark_names = @params[:tag_list]
        mark_names.each do |mark_name|
          MakeMarks.new.mark_with_name(wip, mark_name)
        end
      end

      register_with_readraptor(wip, users)
      push(wip, users)
    end

    wip
  end

  def watch_product
    @product.auto_watch!(@creator)
  end

  def prioritize(wip)
    wip.assign_top_priority
  end

  def register_with_readraptor(wip, users)
    RegisterArticleWithRecipients.perform_async(
      users.map(&:id),
      [nil, :email],
      Wip,
      wip.id
    )
  end

  def push(wip, users)
    channels = users.map{|u| "@#{u.username}"} + [@product.push_channel]
    PusherWorker.perform_async channels, 'wip.created', WipSerializer.new(wip).to_json
  end
end
