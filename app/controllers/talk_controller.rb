class TalkController < ApplicationController

  layout nil

  def index
    @product = Product.find_by_slug!('meta')
    @activity_stream = ActivityStream.new(@product).page(params[:top_id])
    @activity_stream.each do |a|
      a.subject.readraptor_tag = :chat if a.subject.try(:readraptor_tag)
    end

    respond_to do |format|
      format.html do
        @recently_active = @product.watchers.where('last_request_at > ?', 9.days.ago).order(last_request_at: :desc)
        if signed_in?
          MarkAllChatAsRead.perform_async(current_user.id, @product.id)
        end
      end
      format.json do
        render json: @activity_stream.map {|a| ActivitySerializer.new(a, scope: current_user)}
      end
    end

  end

end
