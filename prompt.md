I'm creating an ecommerce website for hijab & other accessories like jilbab, zikr etc etc products for business named Modest Blooming. So i was using and currently too using chatgpt free so browser crashed so starting from all over. So now i'll paste the project descrip[tion and code, so we can start smoothly like every file?
:


Description :
1. Planning & Requirements Breakdown

List Features: Break down your requirements into smaller features/modules. For example:

User Authentication (Login, Signup, Forgot Password)

Product Management (CRUD products, categories, colors)

Coupon Management

Order Management (Cart, Wishlist, Checkout, Order Tracking)

CMS Content Management (Home page content, banners, sales)

Analytics & Reports

Payment Integration (Indian UPI)

UI Components (Header, Footer, Product Cards, Sliders)

Data Modeling: Sketch your MongoDB schema designs. At minimum:

User Schema

Product Schema (with images, colors, categories, price, quantity)

Coupon Schema

Order Schema

CMS Content Schema (for homepage, banners, etc.)

Analytics Schema (tracking orders, sales, user activity)

2. Tech Stack Setup

Initialize your backend with Node.js + Express and MongoDB.

Use Mongoose for schema modeling and DB interactions.

Setup authentication using JWT or Passport.js.

For images, integrate Cloudinary for uploads and storage.

Initialize frontend with Vite + React + Tailwind CSS.

Plan component hierarchy: common UI components (Header, Footer), pages, and reusable components (Product Card, Slider, Filters).

3. Start Backend API Development

Build out the core APIs first:

User Authentication (register/login/forgot password)

Product CRUD APIs (including image upload handling with Cloudinary)

Coupon CRUD APIs

Order APIs (create order, update order status)

CMS APIs (update home page content, banners, sales)

Test APIs with tools like Postman as you build.

4. Build Admin Panel (CMS)

Start with a separate frontend project or admin routes inside the main frontend.

Implement authentication for the admin panel.

Build forms/pages for managing:

Products (with image uploads)

Coupons

Home page content (banners, sales info)

Order status updates

Analytics dashboards (can be simple charts with a library like Chart.js)

5. Frontend User Website

After backend APIs and CMS admin panel are stable, start the customer-facing website.

Implement:

Homepage (dynamic content from CMS)

Shop page with filters and product listings

Product detail page (image slider, colors, quantity selector)

Cart and Wishlist features (state management with Context API or Redux)

Checkout with UPI payment integration (e.g., Razorpay, PhonePe, or Paytm APIs)

6. Integrate Payment Gateway

Research and choose an Indian UPI-compatible payment gateway.

Implement payment in the checkout flow with proper verification and order confirmation.

7. Testing & Optimization

Write unit and integration tests for critical parts.

Test UI responsiveness and cross-browser compatibility.

Optimize API performance and frontend loading times.

8. Deployment

Deploy backend on services like Heroku, AWS, or DigitalOcean.

Deploy frontend on Vercel, Netlify, or similar.

Connect your domain and set up SSL certificates. 
:
So i was building the backend first, so was done with auth, product, coupon management, sale maangement, cms for home page as owner wants everything controlled dynamically using cms/admin/owner & userActions like wishlist & cart, we didn't completed the checkout & order feature as the owner didn't updated me how will the delivery charges will be applicable so this and billing will be done when updated, so we were working on analytics lastly so lets start with it.