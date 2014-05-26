module FormHelper

  def ajax_form_for(record, options = {}, &block)
    options = options.deep_merge(
      remote: true,
      data: {
        'type' => :json,
        'redirect' => options[:redirect],
        'resource' => resource_type(record, options)
      },
    )
    form_for(record, options, &block)
  end

  def resource_type(record, options)
    case record
      when String, Symbol
        record
      else
        object = record.is_a?(Array) ? record.last : record
        raise ArgumentError, "First argument in form cannot contain nil or be empty" unless object
        options[:as] || model_name_from_record_or_class(object).param_key
      end
  end
end
