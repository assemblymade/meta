class TipsController < ApplicationController
  def create
    @event = Event.joins(wip: :product).where('products.slug = ?', params[:product_id]).find(params[:event_id])

    add_cents = params[:tip][:add].to_i
    if add_cents > 0
      @tip = Tip.perform!(
        @event.wip.product,
        current_user,
        @event,
        add_cents
      )

      TipMailer.delay.tipped(@tip.id)
    end

    render nothing: true, status: 200
  end
end
