Urban Threads Clothing Store - Setup Instructions

1. File Structure:
   - Ensure you have all the HTML files in the root directory
   - Create an 'assets/img' folder for product images
   - Add the style.css and script.js files
   - Create the products.json file with your product data

2. Product Images:
   - For each product in products.json, add the corresponding images to assets/img/
   - Make sure the image paths in products.json match your actual image files

3. QR Code:
   - Add your payment QR code image as 'qr-code.png' in assets/img/

4. Features:
   - Fully functional shopping cart with localStorage persistence
   - Product catalog with categories
   - Detailed product pages with image gallery
   - Checkout with QR payment or COD option
   - Order confirmation page
   - Rating system
   - Dark mode toggle
   - Responsive design for mobile devices
   - Animations and notifications

5. To add more products:
   - Simply add new entries to the products.json file following the same format
   - Make sure to add the corresponding images to assets/img/

6. Note:
   - For a production site, you would need to implement server-side code to:
     * Process the order form submissions
     * Handle the payment verification
     * Send confirmation emails
   - This demo uses localStorage to simulate these functions

7. Testing:
   - Open index.html in a web browser
   - The site should work fully offline with all features except:
     * Actual payment processing
     * Form submission to email