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

// Form submission handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if (contactForm && submitBtn) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent default form submission
            
            // Get form data
            const formData = new FormData(contactForm);
            
            // Change button appearance immediately to show loading state
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
            
            // Submit form using fetch API
            fetch(contactForm.action, {
                method: 'POST',
                body: formData
            })
            .then(response => {
                if (response.ok) {
                    // Success - change button to green text with "Submitted" text
                    submitBtn.textContent = 'Submitted';
                    submitBtn.classList.remove('text-black', 'opacity-50', 'cursor-not-allowed');
                    submitBtn.classList.add('text-green-600');
                    submitBtn.disabled = false;
                    
                    // Reset form fields
                    contactForm.reset();
                    
                    // Optional: Reset button after 3 seconds
                    setTimeout(() => {
                        submitBtn.textContent = 'Submit';
                        submitBtn.classList.remove('text-green-600');
                        submitBtn.classList.add('text-black');
                    }, 3000);
                } else {
                    throw new Error('Form submission failed');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Error - reset button and show error state
                submitBtn.textContent = 'Error - Try Again';
                submitBtn.classList.remove('text-black', 'opacity-50', 'cursor-not-allowed');
                submitBtn.classList.add('text-red-600');
                submitBtn.disabled = false;
                
                // Reset button after 3 seconds
                setTimeout(() => {
                    submitBtn.textContent = 'Submit';
                    submitBtn.classList.remove('text-red-600');
                    submitBtn.classList.add('text-black');
                }, 3000);
            });
        });
    }
});


window.onload = function () {
  const animation = document.getElementById("animation");
  const mainContent = document.getElementById("mainContent");

  // Ensure animation is visible, main content is hidden
  animation.style.display = "block";
  mainContent.classList.add("hidden", "opacity-0");

  // After 4 seconds
  setTimeout(() => {
    animation.style.display = "none";

    // Step 1: Make it part of layout
    mainContent.classList.remove("hidden");

    // Step 2: Trigger fade-in after short delay
    setTimeout(() => {
      mainContent.classList.remove("opacity-0");
    }, 50); // ~one frame delay to trigger transition
  }, 4000);
};



// gsap for the line 
// let line = document.getElementById("line");

// gsap.from(["#line","#counter"],{
//     y:"5vh",
//     duration:2,
//     ease:"power2.in"


// })



// images animation
const bgDiv = document.getElementById("bgSlider");

let index = 1;
const totalImages = 8;

setInterval(() => {

  let arr = ["https://plus.unsplash.com/premium_photo-1669863547357-b7d064cedaac?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyfHx8ZW58MHx8fHx8",
     "https://plus.unsplash.com/premium_photo-1750852205683-5be275439ef9?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxOXx8fGVufDB8fHx8fA%3D%3D", 
     "https://images.unsplash.com/photo-1744457167275-99648d0e589d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyNXx8fGVufDB8fHx8fA%3D%3D", 
     "https://plus.unsplash.com/premium_photo-1751385420393-9d321b729ee6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0Mnx8fGVufDB8fHx8fA%3D%3D",
      "https://images.unsplash.com/photo-1750755072927-4221f5018635?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0OHx8fGVufDB8fHx8fA%3D%3D",
       "https://images.unsplash.com/photo-1751356424626-71c30ced9eec?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1OHx8fGVufDB8fHx8fA%3D%3D", 
       "https://images.unsplash.com/photo-1750779940886-edfa73b5c5c6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwxMTV8fHxlbnwwfHx8fHw%3D",
        "https://plus.unsplash.com/premium_photo-1667065570879-4f220100398d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDIwfHx8ZW58MHx8fHx8"];

  bgDiv.style.backgroundImage = `url('${arr[index - 1]}')`;
  // bgDiv.style.backgroundImage = `url('./optimizeLoader/image${index}.jpg')`;

  index++;
  if (index > totalImages) {
    index = 8; // reset to first image
  }
}, 300); // change every 100 milliseconds (0.1 sec)



// gsapfor the fade
// gsap.to("#bgSlider",{
//     opacity:0,
//     delay:3
// }
// )
gsap.to("#bgSlider",{
    height:"100vh",
    opacity:0,
    width:"100vw",
    delay:3.8
}
)

let obj = { val: 0 };
let counter = document.getElementById("counter");

// Create a timeline
let tl = gsap.timeline();

// Step 1: Animate from 0 to 60
tl.to(obj, {
  val: 22,
  duration: 1,
  ease: "power2.out",
  onUpdate: () => {
    counter.textContent = Math.round(obj.val) + "%";
  }
});

// Step 2: Pause (delay)
tl.to({}, { duration: .5 }); // 1 second pause

// Step 3: Animate from 60 to 100
tl.to(obj, {
  val: 100,
  duration: 1,
  ease: "power2.inout",
  onUpdate: () => {
    counter.textContent = Math.round(obj.val) + "%";
  }
});

// animating the nav
gsap.from("#nav", {
  y: -100,
  duration: 1,
  ease: "power2.out",
  delay: 4
});


// splitting  the name 
// split all elements with the class "split" into words and characters
// let split = SplitText.create(".name1", { type: "words, chars" });

// // now animate the characters in a staggered fashion
// gsap.from(split.chars, {
//   duration: 1, 
//   y: 100, 
//   mask: "lines",  
//   delay:4.4,      // animate from 100px below
//   autoAlpha: 0,   // fade in from opacity: 0 and visibility: hidden
//   stagger: 0.05,  // 0.05 seconds between each
// });
// let split1 = SplitText.create(".name2", { type: "words, chars" });

// // now animate the characters in a staggered fashion
// gsap.from(split1.chars, {
//   duration: 1, 
//   y: 100,   
//   mask: "lines",
//   delay:4.5,      // animate from 100px below
//   autoAlpha: 0,   // fade in from opacity: 0 and visibility: hidden
//   stagger: 0.05,  // 0.05 seconds between each
// });

// Split text into characters
let split = SplitText.create(".name1", {
  type: "chars"
});

// Wrap each char in an overflow-hidden inline-block (like a mask)
split.chars.forEach(char => {
  const wrapper = document.createElement("span");
  wrapper.classList.add("overflow-hidden", "inline-block", "align-bottom"); // Tailwind classes

  char.parentNode.insertBefore(wrapper, char);
  wrapper.appendChild(char);
});

// Animate characters from below, only visible while entering
gsap.from(split.chars, {
  y: 200,               // start from below
          // fade in
  duration: 1,
  delay: 4.5,
  stagger: 0.1,
  ease: "power2.out"
});


// Split text into characters
let split1 = SplitText.create(".name2", {
  type: "chars"
});

// Wrap each char in an overflow-hidden inline-block (like a mask)
split1.chars.forEach(char => {
  const wrapper = document.createElement("span");
  wrapper.classList.add("overflow-hidden", "inline-block", "align-bottom"); // Tailwind classes

  char.parentNode.insertBefore(wrapper, char);
  wrapper.appendChild(char);
});

// Animate characters from below, only visible while entering
gsap.from(split1.chars, {
  y: 200,               // start from below
          // fade in
  duration: 1,
  delay: 4.5,
  stagger: 0.1,
  ease: "power2.out"
});

// Enhanced Mobile Menu Functionality
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuLinks = document.querySelectorAll('.mobile-menu-link');

let isMenuOpen = false;

// Function to prevent scrolling
function preventScroll(e) {
  e.preventDefault();
  e.stopPropagation();
  return false;
}

// Function to disable scrolling completely
function disableScroll() {
  // Store current scroll position
  const scrollY = window.scrollY;
  
  // Apply styles to prevent all scrolling
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.overflow = 'hidden';
  document.body.style.width = '100%';
  document.documentElement.style.overflow = 'hidden';
  
  // Prevent touch scrolling and wheel scrolling
  document.addEventListener('touchmove', preventScroll, { passive: false });
  document.addEventListener('wheel', preventScroll, { passive: false });
  document.addEventListener('keydown', preventScrollKeys, { passive: false });
}

// Function to enable scrolling
function enableScroll() {
  // Get the stored scroll position
  const scrollY = document.body.style.top;
  
  // Remove all scroll-preventing styles
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.overflow = '';
  document.body.style.width = '';
  document.documentElement.style.overflow = '';
  
  // Restore scroll position
  window.scrollTo(0, parseInt(scrollY || '0') * -1);
  
  // Remove event listeners
  document.removeEventListener('touchmove', preventScroll);
  document.removeEventListener('wheel', preventScroll);
  document.removeEventListener('keydown', preventScrollKeys);
}

// Prevent scroll with keyboard
function preventScrollKeys(e) {
  const keys = [32, 33, 34, 35, 36, 37, 38, 39, 40]; // space, page up/down, end, home, arrows
  if (keys.includes(e.keyCode)) {
    e.preventDefault();
    return false;
  }
}

// Open mobile menu
mobileMenuBtn.addEventListener('click', () => {
  if (!isMenuOpen) {
    // Open menu
    isMenuOpen = true;
    mobileMenu.style.transform = 'translateX(0)';
    disableScroll();
    
    // Animate hamburger to X
    const spans = mobileMenuBtn.querySelectorAll('span');
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
  } else {
    // Close menu (hamburger X is clicked)
    closeMobileMenuFunction();
  }
});

// Close mobile menu
function closeMobileMenuFunction() {
  isMenuOpen = false;
  mobileMenu.style.transform = 'translateX(100%)';
  enableScroll();
  
  // Reset hamburger icon
  const spans = mobileMenuBtn.querySelectorAll('span');
  spans[0].style.transform = 'rotate(0) translate(0, 0)';
  spans[1].style.opacity = '1';
  spans[2].style.transform = 'rotate(0) translate(0, 0)';
}

// Remove the close button event listener since we removed the close button

// Close menu when a link is clicked with smooth navigation
mobileMenuLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    
    // Close menu first
    closeMobileMenuFunction();
    
    // Smooth scroll to section after menu closes
    if (targetId.startsWith('#')) {
      e.preventDefault();
      setTimeout(() => {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }
      }, 600); // Wait for menu closing animation
    }
  });
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && isMenuOpen) {
    closeMobileMenuFunction();
  }
});

// Handle orientation change to maintain scroll lock
window.addEventListener('orientationchange', () => {
  if (isMenuOpen) {
    setTimeout(() => {
      disableScroll();
    }, 100);
  }
});

// Prevent any scroll leakage when menu is open
window.addEventListener('scroll', () => {
  if (isMenuOpen) {
    const currentTop = parseInt(document.body.style.top || '0');
    window.scrollTo(0, currentTop * -1);
  }
});




// for the icon 
  const favicon = document.getElementById('favicon');
  const icons = ['A.png', 'S.png']; // You can add more if needed
  let indexs = 0;

  setInterval(() => {
    favicon.href = icons[indexs];
    indexs = (indexs + 1) % icons.length;
  }, 1000);



  // rotating  images
  

  gsap.registerPlugin(ScrollTrigger);

  gsap.from("#image1", {
    x: -200,
    rotation: -20,
    scrollTrigger: {
      trigger: "#image1", // Use the variable, not the bare identifier
      start: "top 90%",
      // markers: true // Markers should show if GSAP and ScrollTrigger are loaded
      markers: true // Markers should show if GSAP and ScrollTrigger are loaded
    }
  });