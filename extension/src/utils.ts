// Shared utility functions

// Declare global window interface with content script functions
declare global {
  interface Window {
    isCheckoutPage?: () => boolean;
    getMerchantName?: () => string;
    getPurchaseAmount?: () => number;
    fillCardDetails?: (details: CardDetails | string) => any;
  }
}

/**
 * Get CSS class for card styling based on card name
 */
export function getCardClass(cardName: string): string {
  const lowerCaseName = (cardName || '').toLowerCase();
  
  if (lowerCaseName.includes('wells fargo')) {
    return 'wells-fargo';
  } else if (lowerCaseName.includes('citi')) {
    return 'citi';
  } else if (lowerCaseName.includes('chase')) {
    return 'chase';
  } else if (lowerCaseName.includes('amex') || lowerCaseName.includes('american express')) {
    return 'amex';
  } else if (lowerCaseName.includes('discover')) {
    return 'discover';
  }
  
  return '';
}

/**
 * Debug logger that also outputs to console
 */
export function debugLog(message: string, data?: any) {
  const timestamp = new Date().toISOString();
  const logMsg = `[SWIPE ${timestamp}] ${message}`;
  
  console.log(logMsg);
  if (data !== undefined) {
    console.log(data);
  }
  
  return { message: logMsg, data };
}

/**
 * Create a test request to check if backend is running
 */
export async function testBackendConnection(): Promise<{success: boolean, message: string}> {
  try {
    const response = await fetch('http://localhost:5001/ping', { 
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: `Backend connected: ${data.version} as of ${data.timestamp}`
      };
    } else {
      return {
        success: false,
        message: `Backend error: ${response.status} ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Backend connection failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Interface for credit card form fields found on a page
 */
export interface CardFormFields {
  cardNumberField: HTMLInputElement | null;
  cardNameField: HTMLInputElement | null;
  expiryField: HTMLInputElement | null;
  expiryMonthField: HTMLInputElement | HTMLSelectElement | null;
  expiryYearField: HTMLInputElement | HTMLSelectElement | null;
  cvcField: HTMLInputElement | null;
}

/**
 * Interface for credit card details
 */
export interface CardDetails {
  cardNumber: string;
  cardName: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
}

/**
 * Find credit card form fields on the current page
 */
export function findFormFields(): CardFormFields {
  const fields: CardFormFields = {
    cardNumberField: null,
    cardNameField: null,
    expiryField: null,
    expiryMonthField: null,
    expiryYearField: null,
    cvcField: null
  };
  
  // Common selectors for credit card fields
  const selectors = {
    cardNumber: [
      'input[name="card-number"]',
      'input[name="cardNumber"]',
      'input[name="card_number"]',
      'input[name="number"]',
      'input[autocomplete="cc-number"]',
      'input[name*="creditCard"]',
      'input[id*="cardNumber"]',
      'input[data-cy="card-number-input"]',
      '[name="cardnumber"]'
    ],
    cardName: [
      'input[name="card-name"]',
      'input[name="cardName"]',
      'input[name="card_name"]',
      'input[name="name"]',
      'input[name="ccname"]',
      'input[autocomplete="cc-name"]',
      'input[name*="nameOnCard"]',
      'input[id*="cardholderName"]'
    ],
    expiry: [
      'input[name="card-expiry"]',
      'input[name="cardExpiry"]',
      'input[name="expiry"]',
      'input[name="cc-exp"]',
      'input[autocomplete="cc-exp"]',
      'input[id*="expiration"]',
      'input[id*="expiry"]',
      'input[name="exp-date"]'
    ],
    expiryMonth: [
      'select[name="card-expiry-month"]',
      'select[name="cardExpiryMonth"]',
      'select[name="month"]',
      'select[name="expiryMonth"]',
      'select[id*="expiryMonth"]',
      'select[data-cy="expiry-month"]',
      'input[name="exp-month"]'
    ],
    expiryYear: [
      'select[name="card-expiry-year"]',
      'select[name="cardExpiryYear"]',
      'select[name="year"]',
      'select[name="expiryYear"]',
      'select[id*="expiryYear"]',
      'select[data-cy="expiry-year"]',
      'input[name="exp-year"]'
    ],
    cvc: [
      'input[name="card-cvc"]',
      'input[name="cardCvc"]',
      'input[name="cvc"]',
      'input[name="cvv"]',
      'input[name="csc"]',
      'input[autocomplete="cc-csc"]',
      'input[name*="securityCode"]',
      'input[id*="cvv"]'
    ]
  };
  
  // Find each field
  for (const selector of selectors.cardNumber) {
    const field = document.querySelector(selector) as HTMLInputElement;
    if (field) {
      fields.cardNumberField = field;
      break;
    }
  }
  
  for (const selector of selectors.cardName) {
    const field = document.querySelector(selector) as HTMLInputElement;
    if (field) {
      fields.cardNameField = field;
      break;
    }
  }
  
  for (const selector of selectors.expiry) {
    const field = document.querySelector(selector) as HTMLInputElement;
    if (field) {
      fields.expiryField = field;
      break;
    }
  }
  
  for (const selector of selectors.expiryMonth) {
    const field = document.querySelector(selector) as HTMLInputElement | HTMLSelectElement;
    if (field) {
      fields.expiryMonthField = field;
      break;
    }
  }
  
  for (const selector of selectors.expiryYear) {
    const field = document.querySelector(selector) as HTMLInputElement | HTMLSelectElement;
    if (field) {
      fields.expiryYearField = field;
      break;
    }
  }
  
  for (const selector of selectors.cvc) {
    const field = document.querySelector(selector) as HTMLInputElement;
    if (field) {
      fields.cvcField = field;
      break;
    }
  }
  
  return fields;
}

/**
 * Get test card details based on card name
 */
export function getCardDetails(cardName: string): CardDetails {
  const lowerCaseName = cardName.toLowerCase();
  
  // Default card details
  const defaultDetails: CardDetails = {
    cardNumber: '4242 4242 4242 4242',
    cardName: 'John Doe',
    expiryMonth: '12',
    expiryYear: '2030',
    cvc: '123'
  };
  
  // Card specific details
  if (lowerCaseName.includes('visa') || lowerCaseName.includes('chase') || lowerCaseName.includes('wells fargo')) {
    return {
      ...defaultDetails,
      cardNumber: '4242 4242 4242 4242' // Visa format
    };
  } else if (lowerCaseName.includes('mastercard') || lowerCaseName.includes('citi')) {
    return {
      ...defaultDetails,
      cardNumber: '5555 5555 5555 4444' // Mastercard format
    };
  } else if (lowerCaseName.includes('amex') || lowerCaseName.includes('american express')) {
    return {
      ...defaultDetails,
      cardNumber: '3782 822463 10005', // Amex format
      cvc: '1234' // Amex has 4-digit CVC
    };
  } else if (lowerCaseName.includes('discover')) {
    return {
      ...defaultDetails,
      cardNumber: '6011 1111 1111 1117' // Discover format
    };
  }
  
  return defaultDetails;
} 