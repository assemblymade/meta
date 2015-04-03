class Withholding

  intl_withholding = {}
  intl_withholding['australia'] = 0.1
  intl_withholding['austria'] = 0
  intl_withholding['bangladesh'] = 0.1
  intl_withholding['barbados'] = 0.05
  intl_withholding['belgium'] = 0
  intl_withholding['bulgaria'] = 0.05
  intl_withholding['canada'] = 0
  intl_withholding['china'] = 0.1
  intl_withholding['cis'] = 0
  intl_withholding['cyprus'] = 0
  intl_withholding['czech'] = 0.1
  intl_withholding['denmark'] = 0
  intl_withholding['egypt'] = 0.3
  intl_withholding['estonia'] = 0.1
  intl_withholding['finland'] = 0
  intl_withholding['france'] = 0
  intl_withholding['germany'] = 0
  intl_withholding['greece'] = 0
  intl_withholding['hungary'] = 0
  intl_withholding['iceland'] = 0.05
  intl_withholding['india'] = 0.15
  intl_withholding['indonesia'] = 0.1
  intl_withholding['ireland'] = 0
  intl_withholding['israel'] = 0.15
  intl_withholding['italy'] = 0.08
  intl_withholding['jamaica'] = 0.1
  intl_withholding['japan'] = 0
  intl_withholding['kazakhstan'] = 0.1
  intl_withholding['korea'] = 0.15
  intl_withholding['latvia'] = 0.1
  intl_withholding['lithuania'] = 0.1
  intl_withholding['luxembourg'] = 0
  intl_withholding['malta'] = 0.1
  intl_withholding['mexico'] = 0.1
  intl_withholding['morocoo'] = 0.1
  intl_withholding['netherlands'] = 0
  intl_withholding['newzealand'] = 0.05
  intl_withholding['norway'] = 0
  intl_withholding['pakistan'] = 0
  intl_withholding['philippines'] = 0.15
  intl_withholding['poland'] = 0.1
  intl_withholding['portugal'] = 0.1
  intl_withholding['romania'] = 0.15
  intl_withholding['russia'] = 0
  intl_withholding['slovak'] = 0.1
  intl_withholding['slovenia'] = 0.05
  intl_withholding['southafrica'] = 0
  intl_withholding['spain'] = 0.1
  intl_withholding['srilanka'] = 0.1
  intl_withholding['sweden'] = 0
  intl_withholding['switzerland'] = 0
  intl_withholding['thailand'] = 0.15
  intl_withholding['trinidad'] = 0.15
  intl_withholding['tunisia'] = 0.15
  intl_withholding['turkey'] = 0.1
  intl_withholding['ukraine'] = 0.1
  intl_withholding['unitedkingdom'] = 0
  intl_withholding['venezuela'] = 0.1

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

  def intl_with_form(amount, country)
    country = country.downcase.gsub(" ", "")
    withholding = {"state" => 0}
    if amount > 150000 # $1500 threshold
      withholding['state'] = ((amount - 150000) * 0.07).to_i
    end
    federal_rate = 0.3
    if intl_withholding.has_key?(country)
      federal_rate = intl_withholding[country]
    end
    withholding['federal'] = (federal_rate * intl_withholding[country]).to_i
    withholding
  end

  def intl_no_form(amount)
    domestic_no_form(amount)
  end

end
