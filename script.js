let elems = document.querySelectorAll('.elem')

let page2 = document.querySelector('.page2');
elems.forEach((elem) => {
  elem.addEventListener('mouseenter', () => {
    var bgimg = elem.getAttribute('data-img');
    page2.style.transition = 'background-image 0.4s ease-in-out'; // Add transition
    page2.style.backgroundImage = `url(${bgimg})`;
    page2.style.backgroundRepeat = 'no-repeat'; // Prevent image repetition
    page2.style.backgroundSize = 'cover'; // Ensure the image covers the element
    page2.style.backgroundPosition = 'center'; // Ensure the image covers the element
  });
});



// Image trail effect
const hero = document.querySelector('.hero');
let lastPos = { x: 0, y: 0 };
let lastDirection = { x: 0, y: 0 }; // To track movement direction
const imageSize = 240; // Size of trail images in pixels (from CSS)
const minDistance = imageSize * 0.3; // Reduced from 0.6 to 0.3 (30% of image size) to make images appear faster
let isMouseStill = false;
let stillTimeout;
let staticInterval;

// Image sources for trail (using placeholder images)
const imageUrls = [
 'https://i.pinimg.com/736x/94/d6/6a/94d66a017735db82ba76647e4695b8ac.jpg',
 'https://i.pinimg.com/736x/09/82/70/09827028e812b74970caa859cbf3dec5.jpg',
 'https://i.pinimg.com/736x/21/bb/7c/21bb7c0f0ab3ac3b9dcf5da3b3e38e73.jpg',
 'https://i.pinimg.com/736x/cf/2c/24/cf2c2417a9e4c360ee5f26fee911b981.jpg',
 'https://i.pinimg.com/736x/d0/40/fa/d040fad6ee12bb29c9085a24fc77d7ba.jpg',
 'https://i.pinimg.com/736x/b6/3d/a4/b63da431fc95db2b889ce3346e58a84e.jpg',
 "https://i.pinimg.com/736x/92/77/4f/92774f0a51be3dd2236c2ad06ae777c0.jpg",
 "https://i.pinimg.com/736x/c7/c0/f3/c7c0f344c26187067461347eb6926a1b.jpg",
 "https://i.pinimg.com/736x/60/82/66/608266e85c3c5e2c829eccde976d0294.jpg",
];

// Function to calculate angle based on movement direction
function calculateAngle(dx, dy) {
    // Convert movement to angle in degrees
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
    // Normalize angle to -90 to +90 range to prevent inversion
    if (angle > 90) angle = 180 - angle;
    if (angle < -90) angle = -180 - angle;
    
    // Add some randomness (-10 to +10 degrees) but keep within non-inversion range
    const randomAdjustment = (Math.random() - 0.5) * 20;
    angle += randomAdjustment;
    
    // Ensure angle stays within -90 to 90 range
    angle = Math.max(-90, Math.min(90, angle));
    
    return angle;
}

// Function to get a subtle tilt angle for static cursor
function getSubtleTiltAngle() {
    // Generate angle between -20 and 20 degrees (never inverted)
    return (Math.random() - 0.5) * 40;
}

// Function to create and animate trail images
function createTrailElement(x, y, moveAngle = null) {
    const trailImage = document.createElement('div');
    trailImage.classList.add('trail-image');
    
    // Set random image from our collection
    const randomImage = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    trailImage.style.backgroundImage = `url(${randomImage})`;
    
    // Set position (cursor will be at center)
    trailImage.style.left = `${x}px`;
    trailImage.style.top = `${y}px`;
    
    // Set rotation based on movement direction or subtle tilt for static
    let rotation;
    if (moveAngle === null) {
        // Subtle tilt for static cursor
        rotation = getSubtleTiltAngle();
    } else {
        // Angle based on movement direction for moving cursor
        rotation = moveAngle;
    }
    
    // Set the rotation as a CSS variable for the animation
    trailImage.style.setProperty('--rotation', `${rotation}deg`);
    
    // Add to DOM
    hero.appendChild(trailImage);
    
    // Remove element after animation completes (exactly 4 seconds)
    setTimeout(() => {
        if (trailImage.parentNode === hero) {
            hero.removeChild(trailImage);
        }
    }, 8000);
}

// Function to create random position near cursor when static
function createRandomNearPosition(x, y) {
    const offsetX = (Math.random() - 0.5) * 60;
    const offsetY = (Math.random() - 0.5) * 60;
    return {
        x: x + offsetX,
        y: y + offsetY
    };
}

// Function to handle static cursor effects
function handleStaticCursor(x, y) {
    clearInterval(staticInterval);
    staticInterval = setInterval(() => {
        // For static cursor, images appear at the cursor position
        createTrailElement(x, y, null);
    }, 400); // Static cursor still uses time-based approach (400ms)
}

// Calculate distance between two points
function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Initialize last position on page load
document.addEventListener('DOMContentLoaded', () => {
    lastPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
});

// Track mouse movement and create trail elements
document.addEventListener('mousemove', (e) => {
    // Clear any existing timeouts for static cursor
    clearTimeout(stillTimeout);
    if (isMouseStill) {
        isMouseStill = false;
        clearInterval(staticInterval);
    }
    
    // Calculate direction of movement
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    
    if (dx !== 0 || dy !== 0) {
        lastDirection = { x: dx, y: dy };
    }
    
    // Calculate angle based on movement direction
    const moveAngle = calculateAngle(lastDirection.x, lastDirection.y);
    
    // Calculate distance moved since last image was created
    const distance = calculateDistance(lastPos.x, lastPos.y, e.clientX, e.clientY);
    
    // Create new image only if cursor has moved beyond 60% of image size
    if (distance >= minDistance) {
        createTrailElement(e.clientX, e.clientY, moveAngle);
        // Update last position to current cursor position
        lastPos = { x: e.clientX, y: e.clientY };
    }
    
    // Set timeout to check if mouse is still
    stillTimeout = setTimeout(() => {
        isMouseStill = true;
        handleStaticCursor(e.clientX, e.clientY);
    }, 100);
});

// Stop static effect when mouse leaves window
document.addEventListener('mouseout', () => {
    isMouseStill = false;
    clearInterval(staticInterval);
    clearTimeout(stillTimeout);
});





// from here starts the codenest

