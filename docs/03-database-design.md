# HayDing - Database Design

## Goal of this document

This document defines the first database design for the HayDing MVP.

The goal is to create a clean relational database structure that supports:

- Users
- Products
- Categories
- Product images
- Favorites
- Requests
- Basic messaging
- Reports
- Admin moderation
- Future payment integration
- Future monetization features

The database should be simple enough for the first MVP, but flexible enough to grow later.

---

# 1. Database System

## Main database

```text
MySQL
```

## Development / demo database

```text
H2
```

H2 can be used only for development or demo purposes.  
The main production database should be MySQL.

---

# 2. Naming Conventions

## Table names

Use lowercase plural table names:

```text
users
categories
products
product_images
favorites
requests
conversations
messages
reports
```

## Column names

Use snake_case:

```text
full_name
created_at
updated_at
preferred_language
payment_status
```

## Java entity names

Use PascalCase:

```text
User
Category
Product
ProductImage
Favorite
Request
Conversation
Message
Report
```

## Java field names

Use camelCase:

```text
fullName
createdAt
updatedAt
preferredLanguage
paymentStatus
```

---

# 3. Main Relationships Overview

## User relationships

One user can:

- Create many products
- Add many favorites
- Send many requests as buyer
- Receive many requests as seller
- Participate in many conversations
- Send many messages
- Create many reports

## Product relationships

One product:

- Belongs to one seller
- Belongs to one category
- Has many images
- Can be added to favorites by many users
- Can have many requests
- Can have many reports
- Can have many conversations

## Category relationships

One category:

- Has many products

## Request relationships

One request:

- Belongs to one buyer
- Belongs to one seller
- Belongs to one product

## Conversation relationships

One conversation:

- Belongs to one product
- Has one buyer
- Has one seller
- Has many messages

## Message relationships

One message:

- Belongs to one conversation
- Has one sender

## Report relationships

One report:

- Has one reporter
- Can target a product, user, or message later

---

# 4. Tables

---

# 4.1 users

## Purpose

Stores all platform users.

A user can buy and sell from the same account.

## Table name

```text
users
```

## Columns

| Column | Type | Required | Notes |
|---|---:|---:|---|
| id | BIGINT | Yes | Primary key |
| full_name | VARCHAR(120) | Yes | User full name |
| email | VARCHAR(180) | Yes | Unique |
| password | VARCHAR(255) | Yes | Hashed password |
| city | VARCHAR(120) | Yes | User city in Germany |
| preferred_language | VARCHAR(10) | Yes | de, ar, en |
| role | VARCHAR(30) | Yes | USER or ADMIN |
| enabled | BOOLEAN | Yes | Default true |
| created_at | DATETIME | Yes | Created timestamp |
| updated_at | DATETIME | Yes | Updated timestamp |

## Important constraints

```text
email must be unique
role default = USER
enabled default = true
preferred_language default = de
```

## Future optional fields

```text
phone
avatar_url
bio
last_login_at
email_verified
account_plan
```

---

# 4.2 categories

## Purpose

Stores product categories in three languages.

## Table name

```text
categories
```

## Columns

| Column | Type | Required | Notes |
|---|---:|---:|---|
| id | BIGINT | Yes | Primary key |
| name_de | VARCHAR(100) | Yes | German name |
| name_ar | VARCHAR(100) | Yes | Arabic name |
| name_en | VARCHAR(100) | Yes | English name |
| slug | VARCHAR(120) | Yes | Unique URL-friendly name |
| active | BOOLEAN | Yes | Default true |
| created_at | DATETIME | Yes | Created timestamp |
| updated_at | DATETIME | Yes | Updated timestamp |

## Important constraints

```text
slug must be unique
active default = true
```

## Example categories

| name_de | name_ar | name_en | slug |
|---|---|---|---|
| Kleidung | ملابس | Clothing | clothing |
| Schuhe | أحذية | Shoes | shoes |
| Elektronik | إلكترونيات | Electronics | electronics |
| Möbel | أثاث | Furniture | furniture |
| Haushalt | أدوات منزلية | Household | household |
| Bücher | كتب | Books | books |
| Spielzeug | ألعاب | Toys | toys |
| Sport | رياضة | Sports | sports |
| Kinder | أطفال | Kids | kids |
| Sonstiges | أخرى | Other | other |

---

# 4.3 products

## Purpose

Stores products listed by users.

## Table name

```text
products
```

## Columns

| Column | Type | Required | Notes |
|---|---:|---:|---|
| id | BIGINT | Yes | Primary key |
| title | VARCHAR(160) | Yes | Product title |
| description | TEXT | Yes | Product details |
| price | DECIMAL(10,2) | Yes | Product price |
| city | VARCHAR(120) | Yes | Product city |
| condition_status | VARCHAR(40) | Yes | ProductCondition enum |
| product_status | VARCHAR(40) | Yes | ProductStatus enum |
| seller_id | BIGINT | Yes | FK to users.id |
| category_id | BIGINT | Yes | FK to categories.id |
| created_at | DATETIME | Yes | Created timestamp |
| updated_at | DATETIME | Yes | Updated timestamp |

## Future monetization columns

These fields should exist early or be easy to add later.

| Column | Type | Required | Notes |
|---|---:|---:|---|
| featured | BOOLEAN | Yes | Default false |
| featured_until | DATETIME | No | Until when product is featured |
| boost_score | INT | Yes | Default 0 |
| boosted_until | DATETIME | No | Until when product is boosted |

## Important constraints

```text
price >= 0
product_status default = ACTIVE
condition_status is required
seller_id is required
category_id is required
featured default = false
boost_score default = 0
```

## ProductCondition enum

```text
NEW
LIKE_NEW
GOOD
ACCEPTABLE
USED
```

## ProductStatus enum

```text
ACTIVE
RESERVED
SOLD
DELETED
HIDDEN
```

---

# 4.4 product_images

## Purpose

Stores images for products.

One product can have multiple images.

## Table name

```text
product_images
```

## Columns

| Column | Type | Required | Notes |
|---|---:|---:|---|
| id | BIGINT | Yes | Primary key |
| image_url | VARCHAR(500) | Yes | Image URL or storage path |
| product_id | BIGINT | Yes | FK to products.id |
| main_image | BOOLEAN | Yes | Default false |
| sort_order | INT | Yes | Display order |
| created_at | DATETIME | Yes | Created timestamp |

## Important constraints

```text
product_id is required
sort_order default = 0
main_image default = false
```

## Notes

In MVP, images can be stored locally or as URLs.

Later, images should be stored using:

```text
Cloudinary
S3-compatible storage
```

---

# 4.5 favorites

## Purpose

Stores saved products for users.

One user can favorite many products.

One product can be favorited by many users.

## Table name

```text
favorites
```

## Columns

| Column | Type | Required | Notes |
|---|---:|---:|---|
| id | BIGINT | Yes | Primary key |
| user_id | BIGINT | Yes | FK to users.id |
| product_id | BIGINT | Yes | FK to products.id |
| created_at | DATETIME | Yes | Created timestamp |

## Important constraints

```text
user_id is required
product_id is required
unique(user_id, product_id)
```

This prevents the same user from saving the same product more than once.

---

# 4.6 requests

## Purpose

Stores purchase or interest requests.

When a buyer is interested in a product, they create a request.

A request connects:

- Buyer
- Seller
- Product

## Table name

```text
requests
```

## Columns

| Column | Type | Required | Notes |
|---|---:|---:|---|
| id | BIGINT | Yes | Primary key |
| buyer_id | BIGINT | Yes | FK to users.id |
| seller_id | BIGINT | Yes | FK to users.id |
| product_id | BIGINT | Yes | FK to products.id |
| status | VARCHAR(40) | Yes | RequestStatus enum |
| message | TEXT | No | Optional buyer message |
| created_at | DATETIME | Yes | Created timestamp |
| updated_at | DATETIME | Yes | Updated timestamp |

## Future payment columns

| Column | Type | Required | Notes |
|---|---:|---:|---|
| product_price | DECIMAL(10,2) | Yes | Snapshot of product price |
| platform_fee | DECIMAL(10,2) | Yes | Default 0 |
| buyer_protection_fee | DECIMAL(10,2) | Yes | Default 0 |
| seller_amount | DECIMAL(10,2) | Yes | Default product price |
| payment_status | VARCHAR(40) | Yes | PaymentStatus enum |
| payment_provider | VARCHAR(40) | Yes | PaymentProvider enum |
| buyer_protection_enabled | BOOLEAN | Yes | Default false |

## Important constraints

```text
buyer_id is required
seller_id is required
product_id is required
buyer_id must not equal seller_id
status default = PENDING
payment_status default = NOT_REQUIRED
payment_provider default = NONE
buyer_protection_enabled default = false
platform_fee default = 0
buyer_protection_fee default = 0
```

## RequestStatus enum

```text
PENDING
ACCEPTED
REJECTED
CANCELLED
COMPLETED
```

## PaymentProvider enum

```text
NONE
STRIPE
PAYPAL
```

## PaymentStatus enum

```text
NOT_REQUIRED
PENDING
PAID
FAILED
REFUNDED
CANCELLED
```

---

# 4.7 conversations

## Purpose

Stores conversations between buyer and seller.

In MVP, a conversation is linked to a product.

## Table name

```text
conversations
```

## Columns

| Column | Type | Required | Notes |
|---|---:|---:|---|
| id | BIGINT | Yes | Primary key |
| product_id | BIGINT | Yes | FK to products.id |
| buyer_id | BIGINT | Yes | FK to users.id |
| seller_id | BIGINT | Yes | FK to users.id |
| created_at | DATETIME | Yes | Created timestamp |
| updated_at | DATETIME | Yes | Updated timestamp |

## Important constraints

```text
product_id is required
buyer_id is required
seller_id is required
buyer_id must not equal seller_id
unique(product_id, buyer_id, seller_id)
```

This prevents duplicate conversations between the same buyer and seller for the same product.

---

# 4.8 messages

## Purpose

Stores messages inside conversations.

## Table name

```text
messages
```

## Columns

| Column | Type | Required | Notes |
|---|---:|---:|---|
| id | BIGINT | Yes | Primary key |
| conversation_id | BIGINT | Yes | FK to conversations.id |
| sender_id | BIGINT | Yes | FK to users.id |
| content | TEXT | Yes | Message content |
| is_read | BOOLEAN | Yes | Default false |
| created_at | DATETIME | Yes | Created timestamp |

## Important constraints

```text
conversation_id is required
sender_id is required
content is required
is_read default = false
```

## Future improvements

Later this can support:

```text
real-time messaging
attachments
message status
typing indicator
```

---

# 4.9 reports

## Purpose

Stores reports submitted by users.

Users can report products first.  
Later, users and messages can also be reported.

## Table name

```text
reports
```

## Columns

| Column | Type | Required | Notes |
|---|---:|---:|---|
| id | BIGINT | Yes | Primary key |
| reporter_id | BIGINT | Yes | FK to users.id |
| target_type | VARCHAR(40) | Yes | PRODUCT, USER, MESSAGE |
| target_id | BIGINT | Yes | ID of reported target |
| reason | VARCHAR(255) | Yes | Short reason |
| details | TEXT | No | Optional details |
| status | VARCHAR(40) | Yes | ReportStatus enum |
| created_at | DATETIME | Yes | Created timestamp |
| updated_at | DATETIME | Yes | Updated timestamp |

## Important constraints

```text
reporter_id is required
target_type is required
target_id is required
reason is required
status default = OPEN
```

## ReportTargetType enum

```text
PRODUCT
USER
MESSAGE
```

## ReportStatus enum

```text
OPEN
REVIEWED
RESOLVED
REJECTED
```

---

# 5. Future Tables

These tables are not required in the first MVP but should be considered in the architecture.

---

## 5.1 payments

Future table for real payments.

```text
payments
```

Possible fields:

```text
id
request_id
buyer_id
seller_id
provider
provider_payment_id
amount
currency
platform_fee
buyer_protection_fee
seller_amount
status
created_at
updated_at
```

---

## 5.2 invoices

Future table for invoices.

```text
invoices
```

Possible fields:

```text
id
payment_id
invoice_number
invoice_url
total_amount
currency
created_at
```

---

## 5.3 subscriptions

Future table for seller plans.

```text
subscriptions
```

Possible fields:

```text
id
user_id
plan
status
started_at
expires_at
provider
provider_subscription_id
```

---

## 5.4 promotions

Future table for featured or boosted products.

```text
promotions
```

Possible fields:

```text
id
product_id
user_id
type
status
started_at
ends_at
price
payment_id
```

Promotion types:

```text
FEATURED
BOOST
```

---

# 6. ERD Text Version

```text
users
  1 ─── * products
  1 ─── * favorites
  1 ─── * requests as buyer
  1 ─── * requests as seller
  1 ─── * conversations as buyer
  1 ─── * conversations as seller
  1 ─── * messages
  1 ─── * reports

categories
  1 ─── * products

products
  1 ─── * product_images
  1 ─── * favorites
  1 ─── * requests
  1 ─── * conversations

conversations
  1 ─── * messages
```

---

# 7. SQL Draft

This is a first SQL draft for MySQL.

It can be adjusted later when implementing the Spring Boot entities.

```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    city VARCHAR(120) NOT NULL,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'de',
    role VARCHAR(30) NOT NULL DEFAULT 'USER',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name_de VARCHAR(100) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(160) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    city VARCHAR(120) NOT NULL,
    condition_status VARCHAR(40) NOT NULL,
    product_status VARCHAR(40) NOT NULL DEFAULT 'ACTIVE',
    seller_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    featured_until DATETIME NULL,
    boost_score INT NOT NULL DEFAULT 0,
    boosted_until DATETIME NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_products_seller
        FOREIGN KEY (seller_id) REFERENCES users(id),
    CONSTRAINT fk_products_category
        FOREIGN KEY (category_id) REFERENCES categories(id),
    CONSTRAINT chk_products_price
        CHECK (price >= 0)
);

CREATE TABLE product_images (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    image_url VARCHAR(500) NOT NULL,
    product_id BIGINT NOT NULL,
    main_image BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE favorites (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_favorites_user
        FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_favorites_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT uq_favorites_user_product
        UNIQUE (user_id, product_id)
);

CREATE TABLE requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
    message TEXT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    buyer_protection_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    seller_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(40) NOT NULL DEFAULT 'NOT_REQUIRED',
    payment_provider VARCHAR(40) NOT NULL DEFAULT 'NONE',
    buyer_protection_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_requests_buyer
        FOREIGN KEY (buyer_id) REFERENCES users(id),
    CONSTRAINT fk_requests_seller
        FOREIGN KEY (seller_id) REFERENCES users(id),
    CONSTRAINT fk_requests_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT chk_requests_buyer_seller
        CHECK (buyer_id <> seller_id),
    CONSTRAINT chk_requests_amounts
        CHECK (
            product_price >= 0
            AND platform_fee >= 0
            AND buyer_protection_fee >= 0
            AND seller_amount >= 0
        )
);

CREATE TABLE conversations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    buyer_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_conversations_product
        FOREIGN KEY (product_id) REFERENCES products(id),
    CONSTRAINT fk_conversations_buyer
        FOREIGN KEY (buyer_id) REFERENCES users(id),
    CONSTRAINT fk_conversations_seller
        FOREIGN KEY (seller_id) REFERENCES users(id),
    CONSTRAINT uq_conversation_product_buyer_seller
        UNIQUE (product_id, buyer_id, seller_id),
    CONSTRAINT chk_conversations_buyer_seller
        CHECK (buyer_id <> seller_id)
);

CREATE TABLE messages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    conversation_id BIGINT NOT NULL,
    sender_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    CONSTRAINT fk_messages_conversation
        FOREIGN KEY (conversation_id) REFERENCES conversations(id),
    CONSTRAINT fk_messages_sender
        FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT NOT NULL,
    target_type VARCHAR(40) NOT NULL,
    target_id BIGINT NOT NULL,
    reason VARCHAR(255) NOT NULL,
    details TEXT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'OPEN',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    CONSTRAINT fk_reports_reporter
        FOREIGN KEY (reporter_id) REFERENCES users(id)
);
```

---

# 8. Indexes

Indexes should be added to improve search and filtering.

```sql
CREATE INDEX idx_products_status ON products(product_status);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_city ON products(city);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_featured_boost ON products(featured, boost_score);

CREATE INDEX idx_requests_buyer ON requests(buyer_id);
CREATE INDEX idx_requests_seller ON requests(seller_id);
CREATE INDEX idx_requests_product ON requests(product_id);
CREATE INDEX idx_requests_status ON requests(status);

CREATE INDEX idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX idx_conversations_seller ON conversations(seller_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
```

---

# 9. Important Backend Rules

## User rules

```text
A user can buy and sell from the same account.
A user cannot create a request for their own product.
A user can edit only their own profile.
Admin can disable users.
```

## Product rules

```text
Only the seller can edit their own product.
Only the seller can mark their product as SOLD.
Admin can hide or delete any product.
Deleted products should preferably be soft-deleted using product_status = DELETED.
```

## Favorite rules

```text
A user can favorite a product only once.
A user can remove products from favorites.
A user should not need to favorite their own product.
```

## Request rules

```text
A buyer cannot request their own product.
A request starts with PENDING.
Seller can ACCEPT or REJECT a request.
Buyer can CANCEL a request.
After successful agreement, request can become COMPLETED.
```

## Conversation rules

```text
A conversation is linked to a product.
A buyer and seller should have only one conversation per product.
Only conversation participants can read and send messages.
```

## Report rules

```text
Logged-in users can report products.
Admin can review reports.
Admin can hide reported products.
```

---

# 10. Spring Boot Entity Plan

The first implementation should create these entities:

```text
User
Category
Product
ProductImage
Favorite
Request
Conversation
Message
Report
```

And these enums:

```text
UserRole
ProductCondition
ProductStatus
RequestStatus
PaymentProvider
PaymentStatus
ReportTargetType
ReportStatus
```

---

# 11. Notes About Payments

Payment is not implemented in MVP.

However, the database keeps these fields in the requests table:

```text
product_price
platform_fee
buyer_protection_fee
seller_amount
payment_status
payment_provider
buyer_protection_enabled
```

This helps us later add:

```text
Stripe Connect
PayPal Marketplace
Buyer Protection
Platform Commission
Refunds
Invoices
Payouts
```

without changing the core request structure too much.

---

# 12. Notes About Monetization

Monetization is not active in MVP.

However, the products table keeps:

```text
featured
featured_until
boost_score
boosted_until
```

This helps us later add:

```text
Featured products
Product boost
Paid visibility
Seller promotions
```

without redesigning the product system.

---

# 13. Approved MVP Database Scope

For the first backend implementation, we should start with:

```text
User
Category
Product
ProductImage
```

Then add:

```text
Favorite
Request
Conversation
Message
Report
```

Payments, invoices, subscriptions, and promotions should remain future modules.

---

# 14. Next Step

After this database design is approved, the next step is:

```text
04-backend-setup.md
```

That document will define:

- Spring Boot project setup
- Dependencies
- Package structure
- application.properties
- MySQL connection
- H2 dev profile
- First commit for backend setup