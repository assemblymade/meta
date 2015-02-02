class AutoTipContractSerializer < ApplicationSerializer
    attributes :amount, :active?, :username, :created_on

    def username
      object.user.username
    end

    def created_on
      object.created_at.strftime("%a %m/%d/%y")
    end

end
