# HayDing

HayDing is a multilingual marketplace web application inspired by local classifieds platforms.  
The project allows users to create listings, browse products, manage favorites, communicate through conversations, and maintain a personal account.

The application currently supports German, English, and Arabic, with RTL layout support for Arabic.

---

## Project Status

The project is in active development.

Core marketplace features are already implemented, including:

- User authentication
- Product listing creation
- Product browsing
- Product details
- Categories
- Favorites
- Public seller profiles
- Conversations and messaging
- Notification/unread message handling
- Multilingual UI
- Basic product ownership protection
- Soft delete for products

The current focus is improving stability, UI consistency, backend security, and user experience.

---

## Main Features

### Authentication

Users can register, log in, and access protected parts of the application using token-based authentication.

Protected pages redirect unauthenticated users to the login page.

---

### Products

Users can create product listings with:

- Title
- Description
- Price
- City
- Condition
- Category
- Image URLs

Product listings support multiple images with image navigation.

Implemented product actions:

- Create product
- View active products
- View product details
- View my products
- Update own products
- Mark own products as sold
- Delete own products with soft delete

Deleted products are hidden from public listings and should not be accessible through direct links.

---

### Product Status

Products use status values such as:

- `ACTIVE`
- `SOLD`
- `DELETED`

Important backend rule:

Regular product updates should not freely change product status.  
Status changes should happen only through dedicated actions such as:

- Mark as sold
- Delete product

This protects the product lifecycle and avoids accidental or unauthorized status changes.

---

### Product Ownership Protection

The backend checks that only the seller who owns a product can manage it.

Protected actions include:

- Updating a product
- Deleting a product
- Marking a product as sold

This is handled in the product service using seller validation before allowing changes.

---

### Categories

Products are connected to categories.

The backend validates the selected category when creating or updating a product.

Category support is already integrated into product creation and product data.

---

### Favorites

Logged-in users can add products to favorites and remove them later.

The UI supports favorite buttons on product cards where appropriate.

Important behavior:

- A user should be able to favorite products created by other users.
- A user should not need to favorite their own products.
- Favorite state should remain synced with the backend.

---

### Public Seller Profiles

Users can view public seller profiles.

A public profile may show:

- Seller avatar
- Seller name
- City
- Member since date
- Language
- Bio
- Seller listings

This area should be handled carefully because UI spacing changes can affect the design.  
Future changes should be small and tested visually.

---

### Conversations

Users can communicate about product listings through conversations.

Conversation features include:

- Inbox view
- Conversation list
- Selected conversation panel
- Message history
- Message sending
- Product link inside conversation
- Unread count support
- Auto-refresh for conversations
- Mark conversation notifications as read
- Navbar notification refresh event

The inbox currently shows:

- Other user avatar
- Other user name
- Product title
- Last message preview
- Last message date
- Unread badge when unread messages exist

---

### Emoji Picker in Inbox

The conversation form includes an emoji button.

Current expected behavior:

- Clicking the emoji button opens the emoji picker.
- Clicking an emoji inserts it into the message.
- The emoji picker stays open after selecting an emoji.
- Clicking outside the message form closes the emoji picker.

This was added to improve message usability and match behavior from the older conversation page.

---

## Notifications
 
Conversation notifications are refreshed through a browser event:
 
```js
window.dispatchEvent(new Event("hayding-notifications-updated"));
```
 
This allows the navbar and conversation list to stay in sync after messages are read.
 
---
 
## Multilingual Support
 
The frontend supports:
 
- German
- English
- Arabic
 
Arabic pages use RTL direction.
 
Many UI labels are handled with a helper function similar to:
 
```js
function text(de, ar, en) {
  if (isArabic) return ar;
  if (language === "EN") return en;
  return de;
}
```
 
---
 
## Tech Stack
 
### Backend
 
- Java
- Spring Boot
- Spring Web
- Spring Security
- Jakarta Validation
- Spring Data JPA
- Transactional service layer
- Repository pattern
 
### Frontend
 
- React
- React Router
- Context-based language handling
- CSS in `App.css`
- Local storage for authentication token and current user data
 
---
 
## Backend Structure
 
Important backend areas include:
 
```text
product/controller/ProductController.java
product/service/ProductService.java
product/repository/ProductRepository.java
product/repository/ProductImageRepository.java
product/dto/ProductCreateRequest.java
product/dto/ProductUpdateRequest.java
product/dto/ProductResponse.java
product/model/Product.java
product/model/ProductImage.java
```
 
---
 
## Product API Overview
 
### Get active products
 
```http
GET /api/products
```
 
Returns active products.
 
---
 
### Get my products
 
```http
GET /api/products/my
```
 
Returns the authenticated seller's products, excluding deleted products.
 
---
 
### Get product by ID
 
```http
GET /api/products/{id}
```
 
Returns one product by ID.
 
Deleted products should return an error such as `Product not found`.
 
---
 
### Create product
 
```http
POST /api/products
```
 
Creates a product for the authenticated user.
 
---
 
### Update product
 
```http
PUT /api/products/{id}
```
 
Updates an existing product.
 
Only the owner should be allowed to update the product.
 
Regular updates should not freely change `productStatus`.
 
---
 
### Mark product as sold
 
```http
PATCH /api/products/{id}/mark-sold
```
 
Marks the product as sold.
 
Only the product owner should be allowed to do this.
 
---
 
### Delete product
 
```http
DELETE /api/products/{id}
```
 
Soft deletes the product by setting status to `DELETED`.
 
Only the product owner should be allowed to do this.
 
---
 
## Important Backend Rules
 
### Do not expose deleted products
 
In `ProductService.getProductById`, deleted products should be blocked:
 
```java
if (product.getProductStatus() == ProductStatus.DELETED) {
    throw new IllegalArgumentException("Product not found");
}
```
 
---
 
### Do not allow product status changes from normal update
 
In `updateProduct`, avoid this kind of direct status update:
 
```java
if (request.getProductStatus() != null) {
    product.setProductStatus(request.getProductStatus());
}
```
 
Product status should be changed only by dedicated service methods.
 
---
 
### Validate product owner
 
Before update, delete, or mark sold:
 
```java
private void validateProductOwner(Product product, User seller) {
    if (!product.getSeller().getId().equals(seller.getId())) {
        throw new IllegalArgumentException("You are not allowed to manage this product");
    }
}
```
 
---
 
## Frontend Structure
 
Important frontend areas include:
 
```text
frontend/src/pages/Conversations.jsx
frontend/src/pages/ProductDetails.jsx
frontend/src/pages/PublicUserProfile.jsx
frontend/src/components/Navbar.jsx
frontend/src/components/UserAvatar.jsx
frontend/src/components/ProductCardImage.jsx
frontend/src/services/api.js
frontend/src/context/LanguageContext.jsx
frontend/src/App.css
```
 
---
 
## Conversation UI Notes
 
The active inbox page is:
 
```text
/conversations
```
 
There may also be an older or separate route like:
 
```text
/conversations/:id
```
 
Important note:
 
If different browsers show different layouts, confirm that they are on the same route before debugging.
 
For example:
 
- `/conversations`
- `/conversations/4`
 
These may render different components or layouts.
 
---
 
## Known UI Lessons
 
Some UI areas are sensitive and should be changed carefully:
 
- Public seller profile layout
- Product cards
- Inbox message form
- Listings section spacing
- Mobile and desktop responsive behavior
 
Small CSS changes can affect layout unexpectedly, especially if existing CSS already targets shared classes.
 
Recommended approach:
 
- Make focused changes only.
- Avoid large layout rewrites.
- Prefer adding scoped classes.
- Test in Chrome and Firefox.
- Test German and Arabic layout direction.
- Take screenshots before and after UI changes.
 
---
 
## Current Completed Work Summary
 
Work completed so far includes:
 
- Product controller and service logic
- Product image handling
- Active product listing
- My products listing
- Product owner validation
- Soft delete support
- Mark product as sold
- Product image responses
- Conversation inbox page
- Conversation message loading
- Conversation sending
- Unread count handling
- Notification refresh event
- Inbox scrolling behavior
- Message preview handling
- Emoji picker behavior in inbox
- Basic backend hardening for product status handling
 
---
 
## Recommended Next Steps
 
### 1. Stabilize Conversation UI
 
Make sure the inbox works consistently in:
 
- Chrome
- Firefox
- German
- Arabic
- Mobile width
- Desktop width
 
Check:
 
- Emoji picker opens correctly
- Emoji picker closes when clicking outside
- Message send works
- Scroll stays usable
- Unread count updates
- Navbar notifications refresh
 
---
 
### 2. Improve Backend Error Handling
 
Currently, many errors use `IllegalArgumentException`.
 
A cleaner future improvement would be adding custom exceptions such as:
 
- `NotFoundException`
- `ForbiddenException`
- `BadRequestException`
 
Then map them to proper HTTP status codes:
 
- `404 Not Found`
- `403 Forbidden`
- `400 Bad Request`
 
---
 
### 3. Add Product Search and Filters
 
Useful marketplace filters:
 
- Category
- City
- Price range
- Condition
- Keyword search
- Newest first
 
---
 
### 4. Improve Product Location Input
 
The product city field can later become:
 
```text
Ort oder PLZ
```
 
Recommended validation:
 
- Required
- Minimum 2 characters
- Accept city, village, or German postal code
 
---
 
### 5. Improve Product Details
 
Possible improvements:
 
- Show category clearly
- Show seller info in a compact way
- Add contact seller button
- Add favorite button
- Improve image gallery
 
---
 
### 6. Add Tests
 
Recommended backend tests:
 
- Product owner can update product
- Non-owner cannot update product
- Deleted product cannot be opened
- Product owner can mark product as sold
- Non-owner cannot mark product as sold
- Product owner can delete product
- Non-owner cannot delete product
 
Recommended frontend checks:
 
- Inbox renders conversations
- Selecting conversation loads messages
- Sending message clears input
- Emoji picker inserts emoji
- Emoji picker closes on outside click
 
---
 
## Development Notes
 
Before making changes:
 
```bash
git status
```
 
After a stable change:
 
```bash
git add .
git commit -m "Describe the change"
git push
```
 
Recommended commit messages:
 
```text
Secure product status updates
Add emoji picker to inbox
Improve inbox unread previews
Fix conversation notification refresh
```
 
---
 
## Run Checklist
 
Before considering a feature done:
 
- App builds successfully
- No console errors
- Backend starts successfully
- Main flow works manually
- Chrome tested
- Firefox tested
- Arabic layout checked
- Logged-in and logged-out behavior checked
- Changes committed and pushed
 
---
 
## Project Goal
 
The goal of HayDing is to become a clean, practical, multilingual local marketplace where users can list items, discover products, save favorites, and communicate safely with sellers.
 
The project should prioritize:
 
- Stability
- Clear user experience
- Secure backend rules
- Simple maintainable code
- Careful UI changes
- Multilingual accessibility
