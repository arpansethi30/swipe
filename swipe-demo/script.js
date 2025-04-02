// Fake card details for demonstration
const fakeCardDetails = {
    'Wells Fargo Active Cash': {
        cardNumber: '4111 1111 1111 1111',
        expiryDate: '11/25',
        cvv: '123',
        cardholderName: 'John Doe'
    },
    'Chase Sapphire Reserve': {
        cardNumber: '5555 5555 5555 4444',
        expiryDate: '04/26',
        cvv: '456',
        cardholderName: 'Jane Smith'
    },
    'American Express Gold': {
        cardNumber: '3782 822463 10005',
        expiryDate: '06/27',
        cvv: '1234',
        cardholderName: 'Alex Johnson'
    },
    'Citi Double Cash': {
        cardNumber: '6011 0009 9013 9424',
        expiryDate: '08/24',
        cvv: '789',
        cardholderName: 'Sam Wilson'
    },
    'Discover it Cash Back': {
        cardNumber: '6011 0000 0000 0004',
        expiryDate: '12/26',
        cvv: '321',
        cardholderName: 'Emily Davis'
    }
};

// Function to fill credit card details on the checkout page
function fillCardDetails(cardName) {
    if (!fakeCardDetails[cardName]) {
        console.error(`No details found for card: ${cardName}`);
        return false;
    }

    const cardDetails = fakeCardDetails[cardName];
    
    // Fill card number
    const cardNumberInput = document.getElementById('card-number');
    if (cardNumberInput) {
        cardNumberInput.value = cardDetails.cardNumber;
        cardNumberInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Fill expiry date
    const expiryDateInput = document.getElementById('expiry-date');
    if (expiryDateInput) {
        expiryDateInput.value = cardDetails.expiryDate;
        expiryDateInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Fill security code
    const securityCodeInput = document.getElementById('security-code');
    if (securityCodeInput) {
        securityCodeInput.value = cardDetails.cvv;
        securityCodeInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Fill name on card
    const nameOnCardInput = document.getElementById('name-on-card');
    if (nameOnCardInput) {
        nameOnCardInput.value = cardDetails.cardholderName;
        nameOnCardInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    return true;
}

// Create and show the Swipe recommendation popup
function createRecommendationPopup() {
    const swipePopup = document.getElementById('swipe-popup');
    swipePopup.innerHTML = ''; // Clear any existing content
    
    // Define selected card 
    const selectedCard = 'Wells Fargo Active Cash';

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.className = 'close-button';
    closeBtn.onclick = () => {
        swipePopup.classList.add('hidden');
    };
    swipePopup.appendChild(closeBtn);

    // Create card container
    const cardContainer = document.createElement('div');
    cardContainer.className = 'card-container';

    // Card image
    const cardImage = document.createElement('div');
    cardImage.className = 'card-image';
    
    const cardImg = document.createElement('img');
    cardImg.src = 'https://via.placeholder.com/80x48?text=VISA';
    cardImg.alt = selectedCard;
    cardImage.appendChild(cardImg);
    
    // Card verification checkmark
    const checkmark = document.createElement('div');
    checkmark.className = 'checkmark';
    checkmark.innerHTML = '✓';
    cardImage.appendChild(checkmark);
    
    // Cash back info
    const cashbackInfo = document.createElement('div');
    cashbackInfo.className = 'cashback-info';
    
    const cashbackAmount = document.createElement('div');
    cashbackAmount.textContent = '$0.81 cash back';
    cashbackAmount.className = 'cashback-amount';
    
    const cardName = document.createElement('div');
    cardName.textContent = selectedCard;
    cardName.className = 'card-name';
    
    cashbackInfo.appendChild(cashbackAmount);
    cashbackInfo.appendChild(cardName);
    
    cardContainer.appendChild(cardImage);
    cardContainer.appendChild(cashbackInfo);
    swipePopup.appendChild(cardContainer);

    // Create other cards section
    const otherCards = document.createElement('div');
    otherCards.className = 'other-cards';
    
    const cardsList = document.createElement('div');
    cardsList.className = 'cards-list';
    
    // Add 3 mini card thumbnails
    for (let i = 0; i < 3; i++) {
        const miniCard = document.createElement('div');
        miniCard.className = 'mini-card';
        miniCard.style.backgroundColor = i === 0 ? '#000' : i === 1 ? '#1a478d' : '#333';
        cardsList.appendChild(miniCard);
    }
    
    const plusMore = document.createElement('div');
    plusMore.textContent = '+5';
    plusMore.className = 'plus-more';
    
    const seeAllCards = document.createElement('a');
    seeAllCards.textContent = 'see all cards >';
    seeAllCards.href = '#';
    seeAllCards.className = 'see-all';
    seeAllCards.onclick = (e) => {
        e.preventDefault();
        alert('This would open the full extension popup to show all cards');
    };
    
    cardsList.appendChild(plusMore);
    otherCards.appendChild(cardsList);
    otherCards.appendChild(seeAllCards);
    swipePopup.appendChild(otherCards);

    // Create pay button
    const payButton = document.createElement('button');
    payButton.className = 'pay-button';
    
    const cardIcon = document.createElement('span');
    cardIcon.innerHTML = '&#9642;'; // Credit card icon placeholder
    cardIcon.className = 'card-icon';
    
    const buttonText = document.createElement('span');
    buttonText.textContent = 'pay with selected card';
    
    payButton.appendChild(cardIcon);
    payButton.appendChild(buttonText);

    // Add functionality to automatically fill credit card details
    payButton.onclick = () => {
        // Hide the popup
        swipePopup.classList.add('hidden');
        
        // Attempt to fill the card details
        const filled = fillCardDetails(selectedCard);
        
        if (filled) {
            // Create a success notification
            showSuccessNotification(selectedCard);
        } else {
            // Show the popup again with an error message if filling failed
            swipePopup.classList.remove('hidden');
            alert('Could not find payment form fields to fill. Please enter card details manually.');
        }
    };
    
    swipePopup.appendChild(payButton);
    
    // Show the popup
    setTimeout(() => {
        swipePopup.classList.remove('hidden');
    }, 1500);
}

// Show success notification
function showSuccessNotification(cardName) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.success-notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'success-notification';
        document.body.appendChild(notification);
    }
    
    notification.textContent = `✓ ${cardName} details auto-filled!`;
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }, 500);
}

// Initialize the demo when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Show the Swipe popup after a short delay
    createRecommendationPopup();
    
    // Add demo title to indicate this is a simulated version
    const demoHeader = document.createElement('div');
    demoHeader.style.cssText = `
        background-color: #28a745;
        color: white;
        text-align: center;
        padding: 8px;
        font-weight: bold;
    `;
    demoHeader.textContent = "Swipe Demo - This simulates how the extension would work without installation";
    document.body.prepend(demoHeader);
}); 