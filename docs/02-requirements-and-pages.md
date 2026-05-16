# HayDing - Requirements and Pages

## Goal of this document

This document defines the main user requirements, application pages, frontend components, and backend API areas for the first MVP version of HayDing.

---

# 1. User Types

## Guest User

A guest user can:

- View the homepage
- Browse products
- Search products
- Filter products
- View product details
- Register
- Login

A guest user cannot:

- Add products
- Save favorites
- Contact sellers
- Create requests
- Access profile pages

---

## Logged-in User

A logged-in user can:

- Edit own profile
- Add products
- Edit own products
- Delete or deactivate own products
- Save products as favorites
- Contact sellers
- Create purchase requests
- View own products
- View own favorites
- View own requests
- View messages

---

## Admin

An admin can:

- View users
- Disable users
- Enable users
- View all products
- Hide or delete products
- Manage categories
- View reports
- View requests
- Monitor platform activity

---

# 2. Main Pages

## Public Pages

---

## Home Page

Route:

```text
/
```

Purpose:

- Present the brand
- Show search bar
- Show main categories
- Show latest products
- Show call-to-action buttons

Main sections:

- Hero section
- Search bar
- Category cards
- Latest products
- How it works
- Footer

---

## Products Page

Route:

```text
/products
```

Purpose:

- Display all active products
- Allow search and filtering

Features:

- Product grid
- Search input
- Category filter
- City filter
- Price range filter
- Condition filter
- Sort options

Sort options:

- Newest first
- Price low to high
- Price high to low
- Featured first later

---

## Product Details Page

Route:

```text
/products/:id
```

Purpose:

- Show full details for one product

Content:

- Product images
- Title
- Price
- Description
- Category
- Condition
- City
- Seller info
- Created date
- Contact seller button
- Favorite button
- Report button

---

## Login Page

Route:

```text
/login
```

Purpose:

- Allow user to log in

Fields:

- Email
- Password

Actions:

- Login
- Link to register
- Error display

---

## Register Page

Route:

```text
/register
```

Purpose:

- Allow user to create account

Fields:

- Full name
- Email
- Password
- Confirm password
- City
- Preferred language

Actions:

- Register
- Link to login
- Validation errors

---

## About Page

Route:

```text
/about
```

Purpose:

- Explain HayDing
- Explain marketplace idea
- Build trust
- Explain the slogan: Was du hast, sucht jemand.

---

# 3. Protected User Pages

## Profile Page

Route:

```text
/profile
```

Purpose:

- User can view and edit own profile

Content:

- Full name
- Email
- City
- Avatar later
- Preferred language
- Account creation date

---

## My Products Page

Route:

```text
/my-products
```

Purpose:

- User manages own product listings

Features:

- View own products
- Edit product
- Deactivate product
- Mark as sold
- Delete product if allowed

---

## Add Product Page

Route:

```text
/products/new
```

Purpose:

- User creates a new product listing

Fields:

- Title
- Description
- Price
- Category
- Condition
- City
- Images
- Status default ACTIVE

---

## Edit Product Page

Route:

```text
/products/:id/edit
```

Purpose:

- User edits own product

Important rule:

- User can only edit products that belong to them
- Admin can manage all products from admin panel

---

## Favorites Page

Route:

```text
/favorites
```

Purpose:

- Show products saved by user

Features:

- Product cards
- Remove from favorites
- Open product details

---

## Requests Page

Route:

```text
/requests
```

Purpose:

- Show buying and selling requests

Sections:

- Requests I sent
- Requests I received

Statuses:

- PENDING
- ACCEPTED
- REJECTED
- CANCELLED
- COMPLETED

---

## Messages Page

Route:

```text
/messages
```

Purpose:

- Basic messaging between users

MVP version:

- Conversations linked to product
- Messages between buyer and seller
- Not necessarily real-time in first version

---

# 4. Admin Pages

## Admin Dashboard

Route:

```text
/admin
```

Purpose:

- Overview of platform activity

Content:

- Total users
- Total products
- Active products
- Pending reports
- Latest users
- Latest products

---

## Admin Users Page

Route:

```text
/admin/users
```

Purpose:

- Manage users

Actions:

- View users
- Disable user
- Enable user
- View user products

---

## Admin Products Page

Route:

```text
/admin/products
```

Purpose:

- Manage products

Actions:

- View all products
- Hide product
- Delete product
- View seller

---

## Admin Categories Page

Route:

```text
/admin/categories
```

Purpose:

- Manage categories

Actions:

- Create category
- Edit category
- Disable category

---

## Admin Reports Page

Route:

```text
/admin/reports
```

Purpose:

- Review reports from users

Report targets:

- Product
- User
- Message later

---

# 5. Core Frontend Components

## Layout Components

- MainLayout
- AuthLayout
- AdminLayout
- Navbar
- Footer
- LanguageSwitcher
- MobileMenu

---

## Product Components

- ProductCard
- ProductGrid
- ProductSearchBar
- ProductFilters
- ProductImageGallery
- ProductForm
- ProductStatusBadge
- FavoriteButton

---

## User Components

- ProfileForm
- UserAvatar
- UserInfoCard

---

## Auth Components

- LoginForm
- RegisterForm
- ProtectedRoute
- AdminRoute

---

## Request Components

- RequestCard
- RequestStatusBadge
- RequestTabs

---

## Message Components

- ConversationList
- ChatWindow
- MessageBubble
- MessageInput

---

## Admin Components

- AdminSidebar
- AdminStatsCard
- AdminTable
- AdminActionButton

---

## Common Components

- Button
- Input
- Select
- Textarea
- Modal
- Alert
- Loader
- EmptyState
- Pagination

---

# 6. Backend Modules

The backend should be organized into clear modules/packages.

```text
com.hayding.auth
com.hayding.user
com.hayding.product
com.hayding.category
com.hayding.favorite
com.hayding.request
com.hayding.message
com.hayding.report
com.hayding.admin
com.hayding.monetization
com.hayding.payment
com.hayding.common
com.hayding.config
com.hayding.security
```

---

# 7. Main Entities

## User

Fields:

- id
- fullName
- email
- password
- city
- preferredLanguage
- role
- enabled
- createdAt
- updatedAt

---

## Product

Fields:

- id
- title
- description
- price
- category
- condition
- city
- status
- seller
- createdAt
- updatedAt

Future monetization fields:

- featured
- featuredUntil
- boostScore
- boostedUntil

---

## ProductImage

Fields:

- id
- imageUrl
- product
- mainImage
- sortOrder

---

## Category

Fields:

- id
- nameDe
- nameAr
- nameEn
- active

---

## Favorite

Fields:

- id
- user
- product
- createdAt

---

## Request

Fields:

- id
- buyer
- seller
- product
- status
- message
- createdAt
- updatedAt

Future payment fields:

- productPrice
- platformFee
- buyerProtectionFee
- sellerAmount
- paymentStatus
- paymentProvider
- buyerProtectionEnabled

---

## Conversation

Fields:

- id
- product
- buyer
- seller
- createdAt
- updatedAt

---

## Message

Fields:

- id
- conversation
- sender
- content
- read
- createdAt

---

## Report

Fields:

- id
- reporter
- targetType
- targetId
- reason
- status
- createdAt

---

# 8. Important Enums

## UserRole

```text
USER
ADMIN
```

---

## ProductCondition

```text
NEW
LIKE_NEW
GOOD
ACCEPTABLE
USED
```

---

## ProductStatus

```text
ACTIVE
RESERVED
SOLD
DELETED
HIDDEN
```

---

## RequestStatus

```text
PENDING
ACCEPTED
REJECTED
CANCELLED
COMPLETED
```

---

## PaymentProvider

```text
NONE
STRIPE
PAYPAL
```

---

## PaymentStatus

```text
NOT_REQUIRED
PENDING
PAID
FAILED
REFUNDED
CANCELLED
```

---

## ReportStatus

```text
OPEN
REVIEWED
RESOLVED
REJECTED
```

---

# 9. API Areas

## Auth API

- Register
- Login
- Get current user
- Refresh or validate token later

---

## User API

- Get profile
- Update profile
- Change password later

---

## Product API

- Get all active products
- Get product by id
- Create product
- Update own product
- Delete or deactivate own product
- Mark product as sold
- Search and filter products

---

## Category API

- Get active categories
- Admin create category
- Admin update category
- Admin disable category

---

## Favorite API

- Add to favorites
- Remove from favorites
- Get my favorites

---

## Request API

- Create request for product
- Get sent requests
- Get received requests
- Accept request
- Reject request
- Cancel request
- Complete request

---

## Message API

- Create or get conversation
- Get my conversations
- Get messages in conversation
- Send message
- Mark messages as read later

---

## Report API

- Report product
- Report user later
- Admin review reports

---

## Admin API

- Dashboard stats
- Manage users
- Manage products
- Manage categories
- Manage reports

---

## Future Payment API

Not implemented in MVP.

Reserved areas:

- Create payment session
- Handle payment webhook
- Refund payment
- Seller payout
- Buyer protection fee
- Platform commission

---

# 10. MVP Priority

## Must Have

- Auth
- User profile
- Products
- Categories
- Product images
- Search and filters
- Favorites
- Requests
- Basic messages
- Admin basic management
- Multilingual UI
- Responsive design

---

## Should Have

- Reports
- Product status management
- Mark as sold
- Admin dashboard stats

---

## Could Have Later

- Reviews
- Real-time chat
- Notifications
- Payment integration
- PWA
- Advanced search
- Map/location search

---

# 11. Development Order

Recommended order:

1. Backend project setup
2. Database setup
3. User entity
4. Auth with JWT
5. Category entity
6. Product entity
7. Product images
8. Product APIs
9. Frontend project setup
10. Layout and routing
11. Auth pages
12. Product pages
13. Add product flow
14. Favorites
15. Requests
16. Messages
17. Admin dashboard
18. Multilingual UI polish
19. Responsive design polish
20. Deployment preparation

---

# 12. Notes

## Brand

Current working brand:

```text
HayDing
Was du hast, sucht jemand.
```

The brand name and slogan are temporary-approved for development.

They should not be hardcoded everywhere.

They should be stored in:

```text
frontend config
i18n translation files
backend application properties later if needed
```

---

## Payment

Payment is not part of the first MVP.

However, the system must be designed so payment can be added later without rewriting the main architecture.

Future payment providers:

```text
STRIPE
PAYPAL
```

Initial default values:

```text
paymentProvider = NONE
paymentStatus = NOT_REQUIRED
buyerProtectionEnabled = false
platformFee = 0
buyerProtectionFee = 0
```

---

## Monetization

Monetization is not active in MVP.

But the project should keep space for:

- Featured products
- Boosted products
- Seller subscriptions
- Buyer protection fee
- Platform commission
- Future ads

---

## Technical Direction

Frontend:

```text
React
Vite
JavaScript
React Router DOM
CSS
Responsive Design
Multilingual UI
RTL support for Arabic
```

Backend:

```text
Java
Spring Boot
Spring Web
Spring Data JPA
Spring Security
JWT
REST APIs
Bean Validation
Maven
```

Database:

```text
MySQL
H2 for development or demo only
```

Tools:

```text
Git
GitHub
Docker
Docker Compose
Postman
IntelliJ IDEA
VS Code
phpMyAdmin
```

---

# 13. Next Step

After this document is approved, the next step is:

```text
03-database-design.md
```

This next document will define:

- Database tables
- Relationships
- ERD structure
- Entity fields
- Foreign keys
- Important constraints
- Future payment and monetization fields