class StyleguideController < ApplicationController

  layout false

  def index
    stylesheets_path = Rails.root.join('app', 'assets', 'stylesheets')
    @styleguide = Kss::Parser.new(stylesheets_path)
  end

end
