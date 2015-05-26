class TasksController < WipsController
  wrap_parameters format: [:json]

  after_filter -> { current_user.update(coin_callout_viewed_at: Time.now) if current_user },
    only: :index

  def index
    reject_blacklisted_users!

    respond_to do |format|
      format.html do
        expires_now
        render 'bounties/index'
      end

      format.json do
        if params[:count]
          tasks_count = {
            total: @product.tasks.where(state: ['open', 'awarded']).count
          }
          render json: tasks_count
          return
        end

        # TODO Figure out a better way to do this by manually setting params to FilterWipsQuery
        if params.fetch(:format, 'html') == 'html'
          params.merge!(sort: 'priority', state: 'open')
        end

        @bounties = find_wips
        store_data bounties: @bounties

        @heartables = NewsFeedItem.where(target_id: @bounties.map(&:id))

        response = {
            tags: Wip::Tag.suggested_tags,
            product: ProductSerializer.new(@product, scope: current_user),
            valuation: {
              url: product_wips_path(@product),
              maxOffer: (6 * @product.average_bounty).round(-4),
              averageBounty: @product.average_bounty,
              coinsMinted: @product.coins_minted,
              profitLastMonth: @product.profit_last_month,
              steps: BountyGuidance::Valuations.suggestions(@product),
            },
            assets: ActiveModel::ArraySerializer.new(
              @product.assets.order(created_at: :desc).limit(4),
              each_serializer: AssetSerializer
            )
        }.merge(
          PaginationSerializer.new(
            @bounties,
            each_serializer: BountyListSerializer,
            root: :bounties
          ).as_json
        )

        render json: response
      end
    end
  end

  def new
    @bounty = wip_class.new(product: @product)
  end

  def create
    @bounty = WipFactory.create(
      @product,
      product_wips,
      current_user,
      request.remote_ip,
      wip_params,
      params[:description]
    )

    if @bounty.valid?
      if @product.core_team?(current_user)
        @bounty.update(value: params.fetch(:earnable, 0).to_i)
      end

      @bounty.watch!(current_user)

      if params[:project_id]
        project = @product.milestones.find_by!(number: params[:project_id])
        project.tasks << @bounty
      end

      @activity = Activities::Post.publish!(
        actor: current_user,
        subject: @bounty,
        target: @product,
        socket_id: params[:socket_id]
      )
    end

    # FIXME: Insert the bounty at the top of the current list (bounties or
    # activity) instead of redirecting
    respond_with @bounty, location: @bounty.errors.blank? ? wip_path(@bounty) : nil
  end

  def show
    if params[:cache] == 'false'
      return render json: {
        product: ProductSerializer.new(@product),
        bounty: { id: @wip.id },
      }
    end

    @bounty = @wip # fixme: legacy

    @milestone = MilestoneTask.where('task_id = ?', @bounty.id).first.try(:milestone)
    if signed_in?
      @invites = Invite.where(invitor: current_user, via: @wip)
    end

    store_data product_assets: @bounty.product.assets

    if Watching.watched?(current_user, @bounty.news_feed_item)
      store_data user_subscriptions: [@bounty.news_feed_item.id]
    end

    # FIXME: This call is dominating the worker queue
    # if current_user && @wip
    #   ViewWorker.perform_async(current_user.id, @wip.id, "Wip")
    # end

    respond_to do |format|
      format.html { render 'bounties/show' }
      format.json do
        response = Rails.cache.fetch(@bounty) do
          {
            tags: Wip::Tag.suggested_tags,
            product: ProductSerializer.new(@product, scope: current_user),
            valuation: {
              product: ProductSerializer.new(@product),
              url: product_wips_path(@product),
              maxOffer: (6 * @product.average_bounty).round(-4),
              averageBounty: @product.average_bounty,
              coinsMinted: @product.coins_minted,
              profitLastMonth: @product.profit_last_month,
              steps: BountyGuidance::Valuations.suggestions(@product),
            },
            assets: ActiveModel::ArraySerializer.new(
              @product.assets.order(created_at: :desc).limit(4),
              each_serializer: AssetSerializer
            )
          }
        end.merge(
          bounty: BountySerializer.new(
            @bounty,
            scope: current_user
          ),
          item: NewsFeedItemSerializer.new(@bounty.news_feed_item),
          heartables: @heartables,
          user_hearts: @user_hearts
        )

        render json: response
      end
    end
  end

  def assign
    asignee = current_user
    if user_id = params[:assign_to_user_id]
      if user_id != current_user.id
        authorize! :update, @product
      end
      assignee = User.find(user_id)
    end

    @allocation = @wip.start_work!(assignee)
    respond_with @wip, location: product_wip_path(@product, @wip)
  end

  def lock
    @wip.lock_bounty!(current_user) if can? :update, @wip

    respond_to do |format|
      format.json { render json: @wip }
    end
  end

  def destroy
    # This removes a task from a milestone. Doesn't delete the actual Task
    @milestone = @product.milestones.find_by!(number: params[:project_id])
    @task = @milestone.tasks.find_by!(number: params[:id])
    @milestone.tasks -= [@task]

    render nothing: true, status: 200
  end

  # private

  def find_wips
    FilterWipsQuery.call(product_wips, current_user, params.symbolize_keys).includes(:news_feed_item)
  end

  def wip_class
    Task
  end

  def product_wips
    @product.tasks.includes(:workers, :product, :tags)
  end

  def wip_params
    params.require(:task).permit(:title, :description, tag_list: [])
  end

  def update_wip_params
    params.require(:task).permit(:title, :description, :priority, :priority_above_id, :priority_below_id)
  end
end
