class PaginationSerializer < ActiveModel::ArraySerializer
  def initialize(object, options = {})
    options[:meta] ||= {}
    options[:meta].merge!(pagination: pagination(object))
    super(object, options)
  end

  def pagination(object)
    {
      page:  object.current_page,
      pages: object.total_pages
    }
  end
end
