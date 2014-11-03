class WorkSerializer < ApplicationSerializer
  attributes :metadata, :url

  def metadata
    object.metadata
  end
  
  def url
    object.url
  end
end
