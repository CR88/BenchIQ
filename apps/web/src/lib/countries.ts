export interface Country {
  code: string
  name: string
  addressFormat: {
    stateLabel: string
    postalCodeLabel: string
    postalCodePattern: string
    phoneFormat: string
  }
}

export const COUNTRIES: Record<string, Country> = {
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    addressFormat: {
      stateLabel: 'County',
      postalCodeLabel: 'Postcode',
      postalCodePattern: '^[A-Z]{1,2}[0-9][A-Z0-9]? [0-9][A-Z]{2}$',
      phoneFormat: '+44',
    }
  },
  US: {
    code: 'US',
    name: 'United States',
    addressFormat: {
      stateLabel: 'State',
      postalCodeLabel: 'ZIP Code',
      postalCodePattern: '^[0-9]{5}(-[0-9]{4})?$',
      phoneFormat: '+1',
    }
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    addressFormat: {
      stateLabel: 'Province',
      postalCodeLabel: 'Postal Code',
      postalCodePattern: '^[A-Z][0-9][A-Z] [0-9][A-Z][0-9]$',
      phoneFormat: '+1',
    }
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    addressFormat: {
      stateLabel: 'State',
      postalCodeLabel: 'Postcode',
      postalCodePattern: '^[0-9]{4}$',
      phoneFormat: '+61',
    }
  },
  DE: {
    code: 'DE',
    name: 'Germany',
    addressFormat: {
      stateLabel: 'State',
      postalCodeLabel: 'Postal Code',
      postalCodePattern: '^[0-9]{5}$',
      phoneFormat: '+49',
    }
  },
  FR: {
    code: 'FR',
    name: 'France',
    addressFormat: {
      stateLabel: 'Region',
      postalCodeLabel: 'Postal Code',
      postalCodePattern: '^[0-9]{5}$',
      phoneFormat: '+33',
    }
  },
  ES: {
    code: 'ES',
    name: 'Spain',
    addressFormat: {
      stateLabel: 'Province',
      postalCodeLabel: 'Postal Code',
      postalCodePattern: '^[0-9]{5}$',
      phoneFormat: '+34',
    }
  },
  IT: {
    code: 'IT',
    name: 'Italy',
    addressFormat: {
      stateLabel: 'Province',
      postalCodeLabel: 'Postal Code',
      postalCodePattern: '^[0-9]{5}$',
      phoneFormat: '+39',
    }
  }
}

export const getCountryByCode = (code: string): Country | null => {
  return COUNTRIES[code] || null
}

export const getCountryOptions = () => {
  return Object.values(COUNTRIES).map(country => ({
    value: country.code,
    label: country.name
  }))
}

export const countries = Object.values(COUNTRIES)