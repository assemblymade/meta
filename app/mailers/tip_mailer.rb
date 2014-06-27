class TipMailer < BaseMailer
  include ActionView::Helpers::TextHelper

  layout 'email'

  def tipped(tip_id)
    @tip = Tip.find(tip_id)
    @product = @tip.product
    @user = @tip.to
    @via = @tip.via

    # TODO: we'll fix this when there is a dedicated page for the tip/activity
    # to link people to
    @url = case @via.class.base_class.to_s
    when Event.to_s
      product_wip_url(@product, @via.wip)
    when Activity.to_s
      product_chat_url(@product)
    end
    mail to: @user.email_address,
         subject: "#{@tip.from.username} tipped you #{pluralize(@tip.cents / 100, 'coin')}"
  end

end
