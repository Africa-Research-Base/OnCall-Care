# Healthcare Application - Hospital & Nurse Management Features

## ✅ Features Implemented

### 1. **Hospital Management**
- Add/Create new hospitals
- Update hospital information
- Verify hospitals
- View all hospitals with nurse count
- Hospital verification status tracking

### 2. **Nurse Management**
- Create nurses with **default password: `password123`**
- Update nurse details
- Verify nurses
- Assign nurses to hospitals
- Reset nurse passwords
- Track nurse verification status
- Suspend nurses with customizable reasons and duration
- Contact field for nurses

### 3. **Database Schema**

#### Hospitals Table
```
- id (primary key)
- name (string)
- email (unique)
- phone
- address (text)
- city
- state
- country
- postal_code
- is_verified (boolean, default: false)
- verified_at (timestamp, nullable)
- document_url (string, nullable)
- timestamps
```

#### Added to Nurse Profiles
```
- hospital_id (foreign key, nullable)
```

#### Added to Users
```
- contact (string, nullable) - Additional contact info
- hospital_id (foreign key, nullable)
```

---

## 🔑 Default Credentials

### Admin User (Seeded)
- **Email:** admin@healthcare.com
- **Password:** admin123

### New Nurses (Auto-Generated)
- **Password:** password123

---

## 📡 API Endpoints

### Hospital Management (Admin)
```
GET    /admin/api/hospitals                          - Get all hospitals
POST   /admin/api/hospitals                          - Create hospital
PUT    /admin/api/hospitals/{id}                     - Update hospital
POST   /admin/api/hospitals/{id}/verify              - Verify hospital
GET    /admin/api/hospitals/{id}/nurses              - Get nurses by hospital
```

### Nurse Management (Admin)
```
POST   /admin/api/nurses/create                      - Create nurse (with password123)
GET    /admin/api/nurses                             - Get all nurses
PUT    /admin/api/nurses/{user}/update               - Update nurse details
POST   /admin/api/nurses/{user}/verify               - Verify nurse
GET    /admin/api/hospitals/{hospital}/nurses        - Get nurses by hospital
```

---

## 🌐 Web Interface Routes

### Hospital Management
```
GET    /admin/hospitals                              - View all hospitals
GET    /admin/hospitals/create                       - Create hospital form
POST   /admin/hospitals                              - Store hospital
GET    /admin/hospitals/{id}/edit                    - Edit hospital form
PUT    /admin/hospitals/{id}                         - Update hospital
POST   /admin/hospitals/{id}/verify                  - Verify hospital
GET    /admin/hospitals/{id}/nurses                  - View nurses in hospital
```

### Nurse Management
```
GET    /admin/nurses-manage                          - View all nurses
GET    /admin/nurses-manage/create                   - Create nurse form
POST   /admin/nurses-manage                          - Store nurse (password123)
GET    /admin/nurses-manage/{nurse}/edit             - Edit nurse form
PUT    /admin/nurses-manage/{nurse}                  - Update nurse
POST   /admin/nurses-manage/{nurse}/verify           - Verify nurse
POST   /admin/nurses-manage/{nurse}/reset-password   - Reset password to password123
POST   /admin/nurses-manage/{nurse}/suspend          - Suspend nurse
```

---

## 🔐 Security Features

- Nurse passwords are hashed using Laravel's bcrypt
- Admin authentication required for all management operations
- Authorization checks on all protected routes
- CSRF protection on all forms
- Nurse verification workflow to prevent unauthorized access
- Hospital verification tracking

---

## 📋 Workflow Example

### Step 1: Create Hospital
1. Login as admin (admin@healthcare.com / admin123)
2. Navigate to **Admin > Hospitals > Add Hospital**
3. Fill in hospital details
4. Hospital created with `is_verified = false`

### Step 2: Verify Hospital
1. Click on hospital in hospitals list
2. Click **Verify** button
3. Hospital marked as verified with timestamp

### Step 3: Create Nurse
1. Navigate to **Admin > Nurses Management > Add Nurse**
2. Fill in nurse details:
   - Name, Email, Phone, Contact
   - Select Hospital
   - License Number, Years of Experience
   - Competence Areas (comma-separated)
3. Nurse created with:
   - Password: `password123` (automatically hashed)
   - Status: `is_verified = false`, `account_status = pending`

### Step 4: Verify Nurse
1. Go to **Nurses Management** list
2. Click **Verify** button on pending nurse
3. Nurse marked as verified with active status
4. Nurse can now login and use the app

### Step 5: Reset Password (if needed)
1. Click **🔑** icon on nurse in list
2. Nurse password reset to `password123`
3. Confirmation message displayed

---

## 📧 Contact Information

### Nurses
- **Phone:** Main contact number
- **Contact:** Additional contact information (optional)
- Both can be used to reach nurses

### Hospitals
- **Email:** Hospital email address
- **Phone:** Hospital phone number
- **Contact:** Via assigned nurses

---

## 🗃️ Database Migrations

Three new migrations were created:
1. `2026_05_03_000001_create_hospitals_table.php` - Creates hospitals table
2. `2026_05_03_000002_add_hospital_id_to_nurse_profiles.php` - Adds foreign key to nurse_profiles
3. `2026_05_03_000003_add_contact_and_hospital_id_to_users.php` - Adds fields to users table

Run with:
```bash
php artisan migrate
```

---

## 🌱 Seeding (Optional)

A seeder is available to create sample data:

```bash
php artisan db:seed --class=HospitalAndNurseSeeder
```

This creates:
- 5 hospitals (all verified)
- Admin user (admin@healthcare.com / admin123)
- 15 sample nurses (3 per hospital)
- All with password: `password123`

---

## 📝 Models & Relationships

### Hospital Model
```php
- hasMany(NurseProfile)
- hasMany(User)
```

### NurseProfile Model
```php
- belongsTo(User)
- belongsTo(Hospital)
```

### User Model
```php
- hasOne(NurseProfile)
- hasMany(Address)
- belongsTo(Hospital)
```

---

## ✨ Views Created

Admin interface views:
- `resources/views/admin/hospitals/index.blade.php`
- `resources/views/admin/hospitals/create.blade.php`
- `resources/views/admin/hospitals/edit.blade.php`
- `resources/views/admin/hospitals/nurses.blade.php`
- `resources/views/admin/nurses/index.blade.php`
- `resources/views/admin/nurses/create.blade.php`
- `resources/views/admin/nurses/edit.blade.php`

---

## 🎯 Next Steps (Optional Enhancements)

1. **Email Notifications** - Send welcome emails to new nurses with credentials
2. **Bulk Nurse Import** - CSV import for multiple nurses at once
3. **Document Upload** - Hospital and nurse verification documents
4. **Audit Logs** - Track all admin actions
5. **Two-Factor Authentication** - Enhanced security for admin accounts
6. **Nurse Performance Tracking** - By hospital and location

---

## 📞 Support & Usage

### For Admin:
1. Access admin panel at `/admin`
2. Use credentials: admin@healthcare.com / admin123
3. Manage hospitals and nurses from dashboard

### For Nurses:
1. Use assigned email and password: `password123`
2. Can be contacted via phone/contact field
3. Can login to mobile app or web portal after verification

---

## ✅ Verification Checklist

- ✅ Hospitals can be added to database
- ✅ Nurses can be created with default password: password123
- ✅ Nurses can be assigned to hospitals
- ✅ Nurses have contact information
- ✅ Admin interface for all operations
- ✅ Verification workflow implemented
- ✅ Database relationships set up correctly
- ✅ API endpoints ready for mobile app
- ✅ Web routes for admin panel

---

## 🚀 Running the Application

```bash
# Navigate to backend
cd backend

# Run migrations
php artisan migrate

# (Optional) Seed sample data
php artisan db:seed --class=HospitalAndNurseSeeder

# Start server
php artisan serve

# Access admin panel
# http://localhost:8000/admin
```

All features are now ready to use!
