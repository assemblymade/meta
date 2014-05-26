class ApplicationFormBuilder < ActionView::Helpers::FormBuilder
  include ActionView::Helpers::TagHelper

  def markdown_text_area(attribute, options={})
    form_control = text_area(attribute, {
      rows: 3, class: 'form-control'}.merge(options)
    )
    dropzone_label = content_tag(:div,
      'To attach files drag &amp; drop here or <a href="#">select files from your computer</a>...'.html_safe, class: 'dropzone-inner')

    [form_control, dropzone_label].join.html_safe
  end

end
