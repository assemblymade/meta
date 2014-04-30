class FacebookController < ApplicationController

  layout false

  def channel
    expires_in 1.year, public: true
  end

end
