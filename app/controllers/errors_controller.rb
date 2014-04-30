class ErrorsController < ApplicationController
  layout 'static'

  def not_found
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
