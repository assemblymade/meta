class SavedSearchesController < ApplicationController
  def create
    @saved_search = current_user.saved_searches.create(create_params)
    if @saved_search.valid?
      ProductMailer.delay.saved_search_created(@saved_search.id)
    end
    redirect_to (request.referer || user_path(current_user))
  end

  def destroy
    @saved_search = current_user.saved_searches.find(params[:id])
    @saved_search.destroy
    redirect_to (request.referer || user_path(current_user))
  end

  # private

  def create_params
    params.require(:saved_search).permit(:query)
  end
end
