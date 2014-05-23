class ShortcutsController < ApplicationController
  before_action :set_product

  def show
    @shortcut = @product.shortcuts.find_by(number: params[:number])

    if @shortcut.nil? || @shortcut.target.main_thread?
      redirect_to product_discuss_path(@product)
    else
      redirect_to [@product, @shortcut.target]
    end
  end
end
