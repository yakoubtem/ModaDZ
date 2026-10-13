# ModaDZ 
فكرة المشروع
اسم المشروع (مؤقت)

ModaPOS DZ

برنامج Desktop لإدارة محلات الملابس في الجزائر.

نوع البرنامج
Desktop Application

يعمل على:

Windows

لاحقًا:

MacOS
Linux
الهدف من البرنامج

مساعدة أصحاب محلات الملابس على:

البيع بسرعة
إدارة المخزون
متابعة الأرباح
تنظيم الطلبات
إدارة الزبائن
تقليل الأخطاء
الجمهور المستهدف
العملاء الأساسيون
محلات الملابس
محلات الأحذية
محلات الإكسسوارات
Boutiques نسائية
محلات الأطفال
أصحاب البيع عبر Instagram/Facebook
المشاكل التي يحلها البرنامج
مشاكل حقيقية في السوق الجزائري
1. الفوضى في المخزون

لا يعرف صاحب المحل:

ماذا باع
ماذا بقي
ما الذي نفد
2. أخطاء العمال
نسيان تسجيل المبيعات
أخطاء الحساب
التلاعب
3. عدم معرفة الأرباح

كثير من المحلات لا تعرف:

الربح اليومي
الربح الشهري
المنتجات الأكثر مبيعًا
4. مشاكل المقاسات والألوان

مثال:

نفس المنتج
عدة مقاسات
عدة ألوان
5. عدم وجود نظام احترافي

الكثير يعتمد على:

دفاتر
Excel
WhatsApp
أهداف النسخة الأولى (MVP)

الهدف ليس بناء ERP ضخم.

الهدف:

برنامج بسيط + سريع + جميل + يحل المشاكل الأساسية

الـ Stack التقني
Frontend
React
Vite
Tailwind CSS
Desktop
Electron.js
Database
SQLite
ORM
Prisma
Architecture المشروع
React UI
    ↓
Electron
    ↓
Prisma ORM
    ↓
SQLite Database
هيكلة المشروع
modapos-dz/
│
├── electron/
│   ├── main.js
│   ├── preload.js
│   └── ipc/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── database/
│   └── store.db
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── layouts/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   ├── lib/
│   └── styles/
│
├── public/
│
└── package.json
الموديولات الأساسية
1. Authentication
الهدف

تسجيل الدخول للبرنامج.

الخصائص
Login
Logout
Session
الأدوار
Admin
Cashier
2. Dashboard
الهدف

عرض حالة المحل.

يحتوي على
مبيعات اليوم
الأرباح
عدد المنتجات
المنتجات الناقصة
أفضل المبيعات
3. POS (الكاشي)
أهم جزء في المشروع
الخصائص
البحث عن المنتجات
بالاسم
بالباركود
Cart System
إضافة منتج
تعديل الكمية
حذف منتج
الدفع
حساب المجموع
الخصم
حساب الباقي
Invoice
إنشاء فاتورة
طباعة فاتورة
Keyboard Shortcuts

مثل:

F1 → بحث
F2 → دفع
F3 → فاتورة جديدة
4. Product Management
الخصائص
إضافة منتج

يشمل:

الاسم
الفئة
المقاس
اللون
السعر
الكمية
الصورة
Barcode
تعديل منتج
حذف منتج
Product Variants

مثال:

Nike T-shirt
├── Black / M
├── Black / L
├── White / XL
5. Inventory Management
الخصائص
إدخال مخزون
إخراج مخزون
تنبيه النقص
تاريخ الحركات
6. Customers
الخصائص
الاسم
الهاتف
سجل الشراء
الديون
7. Sales History
الخصائص
كل الفواتير
البحث
فلترة بالتاريخ
إعادة طباعة الفاتورة
8. Statistics
Charts
المبيعات اليومية
الشهرية
الأرباح
أفضل المنتجات
قاعدة البيانات
الجداول الأساسية
User
id
name
email
password
role
createdAt
Product
id
name
barcode
categoryId
buyPrice
sellPrice
quantity
image
createdAt
ProductVariant
id
productId
size
color
quantity
barcode
Category
id
name
Customer
id
name
phone
debt
createdAt
Sale
id
customerId
total
discount
paymentMethod
createdAt
SaleItem
id
saleId
productVariantId
quantity
price
تصميم الواجهة
Style
التصميم المطلوب
Modern
Clean
Fast
Minimal
Colors
اقتراح
Dark Gray
Black
White
Emerald
Blue
Layout
Sidebar

يحتوي:

Dashboard
POS
Products
Inventory
Customers
Sales
Settings
الصفحات المهمة
شاشة البداية
Logo
Login
شاشة الكاشي

يجب أن تكون:

سريعة جدًا
بسيطة
مناسبة للشاشات اللمسية

---

## 🛠️ Configuration de l'environnement de développement (Developer Setup)

### 1. Variables d'environnement (`.env`)
ModaDZ utilise un fichier `.env` local pour configurer la base de données SQLite pour l'outillage Prisma CLI. Ne validez **JAMAIS** votre fichier `.env` ou votre base de données réelle dans Git.

Pour initialiser votre configuration locale :
```bash
# Copier le modèle d'environnement sécurisé
cp .env.example .env
```

Contenu par défaut dans `.env` :
```dotenv
DATABASE_URL="file:./prisma/prisma/store.db"
NODE_ENV="development"
```

### 2. Installation et Lancement
```bash
# Installer les dépendances racine et frontend
npm install
cd modapos-dz && npm install && cd ..

# Générer le client Prisma
npm run prisma:generate

# Lancer l'application en mode développement (React + Electron)
npm run dev
```

