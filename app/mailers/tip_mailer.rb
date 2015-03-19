class TipMailer < BaseMailer
  include ActionView::Helpers::TextHelper

  helper :markdown

  layout 'email'

  def tipped(tip_id)
    mailgun_campaign 'notifications'

    @tip = Tip.find(tip_id)
    @product = @tip.product
    @user = @tip.to
    @via = @tip.via

    # TODO: we'll fix this when there is a dedicated page for the tip/activity
    # to link people to
    @url = case @via.class.base_class.to_s
    when NewsFeedItemComment.to_s
      url_for(@tip.via.url_params)
    when Event.to_s
      product_wip_url(@product, @via.wip)
    when Activity.to_s
      if chat_room = @product.chat_rooms.first
        chat_room_url(@product)
      end
    end
    mail to: @user.email_address,
         subject: "#{@tip.from.username} tipped you #{pluralize(@tip.cents, 'coin')}"
  end

end
