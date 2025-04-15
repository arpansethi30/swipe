// Shared utility functions

/**
 * Get CSS class for card styling based on card name
 */
export function getCardClass(cardName: string): string {
  const cardNameLower = cardName.toLowerCase();
  if (cardNameLower.includes('wells fargo')) return 'wells-fargo';
  if (cardNameLower.includes('citi')) return 'citi';
  if (cardNameLower.includes('chase')) return 'chase';
  if (cardNameLower.includes('amex') || cardNameLower.includes('american express')) return 'amex';
  if (cardNameLower.includes('discover')) return 'discover';
  return '';
}

/**
 * Get dummy card details for demonstration purposes
 */
export function getCardDetails(cardName: string) {
  const cardNameLower = cardName.toLowerCase();
  
  // Demo credit card information (these are fake numbers)
  if (cardNameLower.includes('wells fargo')) {
    return {
      number: '4123456789012345',
      name: 'John Doe',
      expiry: '12/25',
      cvv: '123',
      type: 'visa'
    };
  }
  
  if (cardNameLower.includes('citi')) {
    return {
      number: '5123456789012345',
      name: 'Jane Smith',
      expiry: '11/26',
      cvv: '456',
      type: 'mastercard'
    };
  }
  
  if (cardNameLower.includes('chase')) {
    return {
      number: '4987654321098765',
      name: 'Chris Johnson',
      expiry: '06/27',
      cvv: '789',
      type: 'visa'
    };
  }
  
  if (cardNameLower.includes('amex') || cardNameLower.includes('american express')) {
    return {
      number: '347123456789012',
      name: 'Emily Wilson',
      expiry: '09/26',
      cvv: '1234',
      type: 'amex'
    };
  }
  
  if (cardNameLower.includes('discover')) {
    return {
      number: '6011123456789012',
      name: 'Michael Brown',
      expiry: '03/28',
      cvv: '321',
      type: 'discover'
    };
  }
  
  // Default card
  return {
    number: '4111111111111111',
    name: 'Demo User',
    expiry: '12/25',
    cvv: '999',
    type: 'visa'
  };
}

/**
 * Find form fields in the page that match credit card details
 */
export function findFormFields() {
  const selectors = {
    cardNumber: [
      // Card number selectors
      'input[name*="card"][name*="number"]',
      'input[id*="card"][id*="number"]',
      'input[autocomplete="cc-number"]',
      'input[name*="cardnumber"]',
      'input[id*="cardnumber"]',
      'input[name*="creditcard"]',
      'input[placeholder*="card"][placeholder*="number"]',
      // Generic credit card field patterns
      'input[name*="cc-number"]',
      'input[id*="cc-number"]',
      'input[name*="ccnumber"]',
      'input[id*="ccnumber"]'
    ],
    cardName: [
      // Cardholder name selectors
      'input[name*="card"][name*="name"]',
      'input[id*="card"][id*="name"]',
      'input[autocomplete="cc-name"]',
      'input[name*="cardholder"]',
      'input[id*="cardholder"]',
      'input[name*="name"][name*="card"]',
      'input[id*="name"][id*="card"]',
      'input[placeholder*="name"][placeholder*="card"]'
    ],
    expiryMonth: [
      // Expiry month selectors
      'select[name*="month"]',
      'select[id*="month"]',
      'input[name*="month"]',
      'input[id*="month"]',
      'select[name*="exp"][name*="month"]',
      'select[id*="exp"][id*="month"]',
      'input[autocomplete="cc-exp-month"]'
    ],
    expiryYear: [
      // Expiry year selectors
      'select[name*="year"]',
      'select[id*="year"]',
      'input[name*="year"]',
      'input[id*="year"]',
      'select[name*="exp"][name*="year"]',
      'select[id*="exp"][id*="year"]',
      'input[autocomplete="cc-exp-year"]'
    ],
    expiryDate: [
      // Combined expiry date selectors
      'input[name*="expiry"]',
      'input[id*="expiry"]',
      'input[name*="expiration"]',
      'input[id*="expiration"]',
      'input[autocomplete="cc-exp"]',
      'input[placeholder*="MM"][placeholder*="YY"]',
      'input[placeholder*="MM"][placeholder*="/"][placeholder*="YY"]'
    ],
    cvv: [
      // CVV/CVC selectors
      'input[name*="cvv"]',
      'input[id*="cvv"]',
      'input[name*="cvc"]',
      'input[id*="cvc"]',
      'input[name*="security"][name*="code"]',
      'input[id*="security"][id*="code"]',
      'input[autocomplete="cc-csc"]',
      'input[placeholder*="cvv"]',
      'input[placeholder*="cvc"]',
      'input[placeholder*="security code"]'
    ]
  };
  
  const formFields: Record<string, HTMLElement | null> = {};
  
  // Find each field in the document
  for (const [fieldType, selectorList] of Object.entries(selectors)) {
    for (const selector of selectorList) {
      const field = document.querySelector(selector) as HTMLElement;
      if (field) {
        formFields[fieldType] = field;
        break; // Use the first matching field
      }
    }
  }
  
  return formFields;
} 