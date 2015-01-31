class AssemblyTeam
  FEATURED = %w(
    mdeiters
    chrislloyd
    whatupdave
    vanstee
    awwstn
    pletcher
    barisser
    bshyong
  )
  def self.all
    users = User.where(is_staff: true).to_a
    FEATURED.map{|username| users.find{|u| u.username == username} }
  end
end
