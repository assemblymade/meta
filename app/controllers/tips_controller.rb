class TipsController < ProductController
  before_action :find_product!

  def create
    @via = tip_params[:via_type].constantize.find(tip_params[:via_id])

    add_cents = tip_params[:add].to_i
    if add_cents > 0
      @tip = Tip.perform!(
        @product,
        current_user,
        @via,
        add_cents
      )

      TipMailer.delay(queue: 'mailer').tipped(@tip.id)
      Activities::Tip.publish!(
        actor: current_user,
        subject: @tip,
        target: @tip.to
      )
    end

    render nothing: true, status: 200
  end

  def tip_params
    params.require(:tip).permit(:add, :via_type, :via_id)
  end
end
