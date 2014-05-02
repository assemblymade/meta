class ShortcutsController < ApplicationController
  before_action :set_product

  def show
    @shortcut = @product.shortcuts.find_by!(number: params[:number])
    redirect_to [@product, @shortcut.target]
  end
end