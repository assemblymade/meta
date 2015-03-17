class AwardedBountiesQuery
  attr_reader :user, :params

  def initialize(user, params)
    @user = user
    @params = params
  end

  def awards
    Award.unscoped.select('awards.*').
      joins(wip: :product).
      from(Arel.sql("(#{ranked_bounties_query}) AS awards")).
      where('bounty_count <= 5').
      where.not(wips: {product_id: Product.private_ids}).
      page(params[:page]).per(50)
  end

  def ranked_bounties_query
    Award.
      joins(:wip).
      where(winner_id: user.id).
      select(%{
        awards.*,
        row_number() over (partition by product_id order by awards.created_at desc) as bounty_count
      }).to_sql
  end
end
