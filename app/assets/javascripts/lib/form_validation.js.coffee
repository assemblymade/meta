$(document).ready ->

  formValidationRules = ($form)->
    $.data($form, 'validations') || {}

  updateFormValidations = (el, val)->
    $form = $(el).parents('form:first')[0]
    rules = formValidationRules($form)
    rules[el] = val
    $.data($form, 'validations', rules)
    $form

  updateFormValidationState = ($form)->
    if _.contains(_.values(formValidationRules($form)), false)
      $('button.form-actions,.form-actions button', $form).attr('disabled', 'disabled')
    else
      $('button.form-actions,.form-actions button', $form).removeAttr('disabled')

  # click required
  validateClickRequired = (el)->
    $('input:checked', $(el).parent()).length > 0

  $('[data-click-required]').each ->
    $form = updateFormValidations(@, validateClickRequired(@))
    updateFormValidationState($form)

  $('[data-click-required]').on 'click change', (e)->
    $form = updateFormValidations(@, validateClickRequired(@))
    updateFormValidationState($form)

  # min length on text field
  validateLength = (el)->
    inputLength = $(el).val().length
    minLength = $(el).data('validate-length')
    inputLength >= minLength

  $('[data-validate-length]').each ->
    $form = updateFormValidations(@, validateLength(@))
    updateFormValidationState($form)

  $('[data-validate-length]').on 'keyup change blur', (e)->
    $form = updateFormValidations(@, validateLength(@))
    updateFormValidationState($form)

