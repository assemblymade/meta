class TipsController < ProductController
  before_action :find_product!

  def create
    @via = tip_params[:via_type].constantize.find(tip_params[:via_id])

    add_cents = tip_params[:add].to_i
    if add_cents == 0
      render nothing: true, status: 200
      return
    end

    @tip = Tip.perform!(
      @product,
      current_user,
      @via,
      add_cents
    )

    if @tip.nil?
      render nothing: true, status: 400
      return
    end

    Karma::Kalkulate.new.karma_from_tip(@tip)
    Activities::Tip.publish!(
      actor: current_user,
      subject: @tip,
      target: @tip.to
    )
    @product.auto_watch!(current_user)

    unless @via.is_a? Activities::GitPush
      # no template for this, let's just skip it
      TipMailer.delay(queue: 'mailer').tipped(@tip.id)
    end

    render nothing: true, status: 200
  end

  def tip_params
    params.require(:tip).permit(:add, :via_type, :via_id)
  end
end
