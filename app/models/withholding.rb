class Withholding

  def domestic_no_form(amount)  #ALL AMOUNTS ARE IN CENTS
    withholding = {}
    withholding['federal'] = (amount * 0.28).to_i
    if amount > 150000 # $1500 threshold
      withholding['state'] = ((amount - 150000) * 0.07).to_i
    else
      withholding['state'] = 0
    end
  end

  def domestic_with_form(amount)
    #NO WITHHOLDING FEDERAL OR STATE
    withholding = {}
    withholding['federal'] = 0
    withholding['state'] = 0
    withholding
  end

  def intl_with_form()
    withholding = {}
    if amount > 150000 # $1500 threshold
      withholding['state'] = ((amount - 150000) * 0.07).to_i
    else
      withholding['state'] = 0
    end


  end

  def intl_no_form()
    withholding = {}
    withholding['federal'] = (amount * 0.28).to_i
    if amount > 150000 # $1500 threshold
      withholding['state'] = ((amount - 150000) * 0.07).to_i
    else
      withholding['state'] = 0
    end
  end

end
