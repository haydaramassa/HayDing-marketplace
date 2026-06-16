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

### Notifications

Conversation notifications are refreshed through a browser event:

```js
window.dispatchEvent(new Event("hayding-notifications-updated"));
