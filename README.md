# 👕 Advanced Clothing Management System

<p align="center">
  <strong>Enterprise-style clothing e-commerce and inventory management system built with Java, Jakarta EE, Hibernate, Jersey REST API, and MySQL.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk" alt="Java">
  <img src="https://img.shields.io/badge/Jakarta%20EE-Enterprise-blue?style=for-the-badge" alt="Jakarta EE">
  <img src="https://img.shields.io/badge/Hibernate-ORM-brown?style=for-the-badge&logo=hibernate" alt="Hibernate">
  <img src="https://img.shields.io/badge/Jersey-REST%20API-green?style=for-the-badge" alt="Jersey">
  <img src="https://img.shields.io/badge/MySQL-Database-blue?style=for-the-badge&logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/Maven-Build-red?style=for-the-badge&logo=apachemaven" alt="Maven">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PayHere-Payment-00A86B?style=flat-square" alt="PayHere">
  <img src="https://img.shields.io/badge/Mailtrap-Email%20Testing-7B61FF?style=flat-square" alt="Mailtrap">
  <img src="https://img.shields.io/badge/REST-API-02569B?style=flat-square" alt="REST API">
  <img src="https://img.shields.io/badge/Inventory-Management-orange?style=flat-square" alt="Inventory">
</p>

---

## 📌 Overview

**Advanced Clothing Management System** is a full-stack clothing e-commerce and business management platform designed to manage products, clothing variants, inventory, customers, orders, payments, invoices, emails, and sales analytics from a centralized system.

The system provides both a **customer-facing shopping experience** and a powerful **administrative dashboard** for managing day-to-day clothing business operations.

### 🎯 Main Objectives

* Manage clothing products and variants efficiently
* Track inventory at color and size level
* Process customer orders
* Integrate online payments
* Generate invoices automatically
* Send transactional email notifications
* Analyze sales and business performance
* Provide centralized administration

---

# ✨ Core Features

## 🔐 Authentication & Authorization

* Customer and administrator authentication
* Role-based access control
* Protected administrative operations
* Session-based authentication
* Secure password handling
* Customer profile management

---

## 👕 Product & Variant Management

Designed specifically for clothing products with flexible variant management.

### Product Management

* Create, update, and delete products
* Product categories
* Product descriptions
* Product images
* Product search
* Product filtering
* Product availability management

### Clothing Variants

Each product can contain multiple colors and sizes with independent pricing and inventory.

```text
T-Shirt
│
├── Black
│   ├── S → Rs. 2,500
│   ├── M → Rs. 2,500
│   └── L → Rs. 2,700
│
├── White
│   ├── S → Rs. 2,500
│   ├── M → Rs. 2,500
│   └── L → Rs. 2,700
│
└── Red
    ├── M → Rs. 2,600
    └── L → Rs. 2,800
```

Supported variant information includes:

* Color name
* Color code
* Size
* Price
* Quantity
* Variant-specific images

---

# 📦 Inventory Management

The inventory module provides detailed stock control at the individual product-variant level.

### Features

* Real-time stock quantity tracking
* Color and size-level inventory
* Stock availability validation
* Low-stock monitoring
* Stock updates
* Inventory filtering
* Product availability management

```text
Product
   ↓
Variant
   ↓
Color + Size
   ↓
Quantity
   ↓
Stock Status
```

This allows administrators to accurately monitor individual clothing variants instead of maintaining only product-level stock.

---

# 🛒 Order Management

Complete order processing from shopping cart to completion.

### Features

* Shopping cart management
* Product quantity management
* Checkout
* Order creation
* Order item management
* Customer order history
* Order verification
* Order status tracking
* Completed order management

### Order Workflow

```text
Cart
  ↓
Checkout
  ↓
Payment
  ↓
Verification
  ↓
Order Processing
  ↓
Completed
```

---

# 💳 PayHere Payment Integration

The system integrates **PayHere** for online payment processing.

### Payment Features

* Online checkout
* PayHere integration
* Payment initialization
* Payment verification
* Order-payment relationship
* Payment status tracking
* Successful payment handling
* Failed payment handling

### Payment Workflow

```text
Customer
   ↓
Checkout
   ↓
PayHere
   ↓
Payment
   ↓
Payment Verification
   ↓
Order Confirmation
```

---

# 🧾 Invoice Generation

Invoices can be generated as part of the completed order workflow.

### Invoice Includes

* Invoice number
* Customer information
* Order information
* Product details
* Quantity
* Unit price
* Total amount
* Payment information

```text
Order
  ↓
Payment Verification
  ↓
Invoice Generation
  ↓
Customer Invoice
```

---

# 📧 Email Notification System

The project integrates **Mailtrap** for testing transactional email functionality during development.

### Email Features

* Order confirmation emails
* Payment-related notifications
* Order status notifications
* Customer notifications
* SMTP-based email delivery
* Email template support

```text
Order Event
    ↓
Backend Mail Service
    ↓
SMTP
    ↓
Mailtrap
    ↓
Email Preview
```

Mailtrap provides a safe development environment for testing application emails without sending test messages to real customers.

---

# 📊 Admin Dashboard & Analytics

The administration panel provides a centralized view of the clothing business.

### Dashboard Information

* Total sales
* Total orders
* Total customers
* Product statistics
* Inventory statistics
* Revenue
* Sales trends
* Order status
* Best-selling products
* Stock availability

### Sales Analytics

* Daily sales
* Weekly sales
* Monthly sales
* Total revenue
* Total orders
* Average order value
* Product performance
* Category performance
* Best-selling products

### Business Overview

```text
                    ADMIN DASHBOARD

        ┌──────────────┬──────────────┬──────────────┐
        │   Revenue    │    Orders    │  Customers   │
        └──────────────┴──────────────┴──────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
     Products      Inventory      Sales Trends
        │              │              │
        └──────────────┼──────────────┘
                       ▼
                Business Analytics
```

---

# 🔎 Search & Filtering

Search and filtering are available across major management modules.

* Product search
* Category filtering
* Color filtering
* Size filtering
* Variant filtering
* Stock filtering
* Customer search
* Order filtering
* Sales data filtering

---

# 🌐 RESTful API

The backend exposes RESTful APIs using **Jersey**.

### API Structure

```text
/api
│
├── /auth
├── /users
├── /products
├── /categories
├── /variants
├── /inventory
├── /orders
├── /payments
├── /invoices
├── /analytics
└── /notifications
```

The REST API separates frontend communication from business logic and database operations.

---

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │    Customer UI       │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │    Admin Panel       │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │    Jersey REST API   │
                    └──────────┬───────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
   ┌─────────────┐     ┌─────────────┐      ┌─────────────┐
   │   Services  │     │   Payment   │      │    Mail     │
   │    Layer    │     │   Service   │      │   Service   │
   └──────┬──────┘     └──────┬──────┘      └──────┬──────┘
          │                    │                    │
          ▼                    ▼                    ▼
   ┌─────────────┐          PayHere              Mailtrap
   │  Hibernate  │
   │     ORM     │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │    MySQL    │
   └─────────────┘
```

---

# 🗄️ Database Design

The system uses **MySQL** as the primary relational database.

### Main Entities

```text
User
 │
 └── Role

Product
 │
 ├── Category
 │
 └── ProductVariant
       │
       ├── Color
       ├── Size
       ├── Price
       ├── Quantity
       └── Images

Order
 │
 └── OrderItems
       │
       └── ProductVariant

Payment
 │
 └── Order

Invoice
 │
 └── Order
```

The database structure supports relationships between products, variants, customers, inventory, orders, payments, and invoices.

---

# 🛠️ Technology Stack

| Technology    | Purpose                         |
| ------------- | ------------------------------- |
| ☕ Java 21     | Application development         |
| Jakarta EE    | Enterprise application platform |
| Hibernate ORM | Object-relational mapping       |
| Jersey        | RESTful web services            |
| MySQL         | Relational database             |
| Maven         | Dependency management           |
| HTML5         | Frontend structure              |
| CSS3          | Styling                         |
| JavaScript    | Client-side functionality       |
| Bootstrap     | Responsive UI                   |
| PayHere       | Online payment processing       |
| Mailtrap      | Transactional email testing     |
| Git / GitHub  | Version control                 |

---

# 🔄 Complete Business Workflow

```text
Customer
   │
   ▼
Browse Products
   │
   ▼
Select Color & Size
   │
   ▼
Add to Cart
   │
   ▼
Checkout
   │
   ▼
PayHere Payment
   │
   ▼
Payment Verification
   │
   ▼
Order Creation
   │
   ├──────────────► Inventory Update
   │
   ├──────────────► Invoice Generation
   │
   └──────────────► Email Notification
                         │
                         ▼
                      Mailtrap
```

---

# 📸 Screenshots

## 🔐 Login

<p align="center">
  <img src="https://github.com/user-attachments/assets/eddbe4c2-407e-46b6-bedb-7937a793cf6d" width="90%" alt="Login">
</p>

---

## 🛍️ Customer Experience

<p align="center">
  <img src="https://github.com/user-attachments/assets/598de597-ec48-4563-8540-18206954913c" width="90%" alt="Customer Dashboard">
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/6e4abca5-463a-4dee-8b79-c3054089b18c" width="90%" alt="Customer Products">
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/a7bea51d-f376-4e34-9f9c-1d370965461e" width="90%" alt="Customer Product View">
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/fd54f0f7-42a3-4360-8606-71d1ada6f857" width="90%" alt="Customer Shopping Experience">
</p>

---

## 📊 Admin Dashboard

<p align="center">
  <img src="https://github.com/user-attachments/assets/149eaef6-25fa-45e6-b438-59efe2a2dad8" width="90%" alt="Admin Dashboard">
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/31fe6c0c-8034-4da2-bd9e-8a753e38f41e" width="90%" alt="Admin Analytics">
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/62a09507-6882-4033-ac81-e4c6179c40bf" width="90%" alt="Admin Management">
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/889cd87f-b4f5-4393-9991-bc4cd7c17e38" width="90%" alt="Admin Orders">
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/f9715002-e576-4090-b930-ed1b3ccb1fe3" width="90%" alt="Admin Inventory">
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/9303af26-ea75-4944-bb5b-3d61ac916b2e" width="90%" alt="Admin Analytics">
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/6e75b574-070c-426d-9e42-19b41eac431a" width="90%" alt="Admin Management">
</p>

---

## 👕 Product Management

<p align="center">
  <img src="https://github.com/user-attachments/assets/9a410074-f629-4b26-8f35-0d286e878c0d" width="90%" alt="Product Management">
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/7a19e0b0-3764-4629-8e71-689e7de4e0bb" width="90%" alt="Product Management">
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/528f5374-7e5f-46d4-98b3-bbedff601c98" width="90%" alt="Product Variant Management">
</p>

---

# 🚀 Getting Started

## Prerequisites

Install the following before running the project:

* Java JDK
* Apache Maven
* MySQL Server
* Jakarta EE compatible server
* Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/ChathuraHareshan/OpenBay.git
cd OpenBay
```

---

## 2. Create the Database

Create the MySQL database:

```sql
CREATE DATABASE openbay;
```

Configure your database connection according to the project's configuration.

Example:

```properties
DB_HOST=localhost
DB_PORT=3306
DB_NAME=openbay
DB_USERNAME=root
DB_PASSWORD=your_password
```

> ⚠️ Never commit real database passwords, API keys, payment credentials, or other sensitive information to GitHub.

---

## 3. Build the Project

```bash
mvn clean install
```

---

## 4. Deploy

Deploy the generated application to a compatible Jakarta EE application server.

Then open:

```text
http://localhost:8080/openbay
```

---

# 📁 Project Structure

```text
OpenBay/
│
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── ...
│   │   │
│   │   ├── resources/
│   │   │   └── ...
│   │   │
│   │   └── webapp/
│   │       ├── admin/
│   │       ├── css/
│   │       ├── js/
│   │       ├── images/
│   │       └── ...
│   │
│   └── test/
│       └── ...
│
├── pom.xml
└── README.md
```

---

# 🔒 Security

The application includes several security-oriented practices:

* Authentication
* Authorization
* Role-based access control
* Password protection
* Protected admin functionality
* Server-side validation
* Database constraints
* Separation of sensitive configuration

Sensitive configuration should be excluded using `.gitignore`.

---

# 🚀 Future Improvements

Potential future enhancements include:

* 📱 Dedicated mobile application
* 📷 Barcode / QR code integration
* ☁️ Cloud deployment
* 📦 Advanced warehouse management
* 🔔 Real-time notifications
* 📈 More advanced business intelligence
* 🤖 AI-powered sales and inventory insights

---

# 🎓 What This Project Demonstrates

This project demonstrates practical experience in:

* Java Enterprise Development
* Jakarta EE
* Hibernate ORM
* RESTful API Development
* Jersey
* MySQL Database Design
* Object-Oriented Programming
* Authentication & Authorization
* Role-Based Access Control
* Clothing Variant Management
* Inventory Management
* Shopping Cart Development
* Order Processing
* Payment Integration
* Payment Verification
* Invoice Generation
* Email Integration
* Sales Analytics
* Admin Dashboard Development
* Database Relationships
* CRUD Operations
* Backend Service Architecture
* Full-Stack Web Development

---

# 👨‍💻 Developer

## Chathura Hareshan

**Software Engineering Undergraduate**

```text
Java • Jakarta EE • Hibernate • Jersey
MySQL • REST APIs • HTML • CSS
JavaScript • Bootstrap • Git • GitHub
```

---

# ⭐ Support

If you find this project useful or interesting, consider giving the repository a ⭐ on GitHub.

<p align="center">
  <strong>Built with Java ☕ and passion for software engineering.</strong>
</p>
