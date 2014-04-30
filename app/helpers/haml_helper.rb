module HamlHelper
  def hidden
    { style: 'display: none' }
  end

  def authenticate
    { 'data-authenticate' => true }
  end
  
  def button_color(index)
    %w(btn-blue btn-yellow btn-green btn-orange)[index]
  end
end