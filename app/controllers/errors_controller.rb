class ErrorsController < ApplicationController
  layout 'static'

  def not_found
    @background = rand(1..5)
    respond_to do |format|
      format.html
      format.json do
        render json: {}, :status => :not_found
      end
    end
  end

  def error
  end

  def maintenance
  end

  def test_exception
    raise 'Test Crash!'
  end

  def test_heroku
    sleep 35
    render text: 'You should not see this page :('
  end
end
