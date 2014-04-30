class StaffConstraint
  def matches?(request)
    if user = request.env['warden'].user
      user.staff?
    else
      request.env['warden'].authenticate!
    end  
  end
end
