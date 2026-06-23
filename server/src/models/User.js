// User.js - The User Model
// This defines what a "user" looks like in our database
// Every citizen and admin account follows this blueprint

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─────────────────────────────────────────
// STEP 1: DEFINE THE SCHEMA
// Schema = the blueprint/rules for our data
// ─────────────────────────────────────────

const userSchema = new mongoose.Schema(
    {
        // Full name of the user
        name: {
            type: String,
            required: [true, 'Name is required'],    // Custom error message
            trim: true,                               // Removes extra spaces
            minlength: [2, 'Name must be at least 2 characters'],
            maxlength: [50, 'Name cannot exceed 50 characters']
        },

        // Email - must be unique across all users
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,                             // No two users can have same email
            lowercase: true,                          // Always store as lowercase
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address'
            ]
        },

        // Password - we will NEVER store plain text
        // bcrypt will hash this before saving
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select: false   // IMPORTANT: password won't be returned in queries by default
        },

        // Phone number
        phone: {
            type: String,
            trim: true,
            match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
        },

        // Role determines what the user can do
        role: {
            type: String,
            enum: ['citizen', 'admin'],    // Only these two values allowed
            default: 'citizen'             // New registrations are citizens by default
        },

        // Address - nested object (subdocument)
        address: {
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            pincode: {
                type: String,
                match: [/^[1-9][0-9]{5}$/, 'Please provide a valid 6-digit pincode']
            }
        },

        // Profile picture URL (stored in Cloudinary, we save the URL here)
        profilePicture: {
            type: String,
            default: ''
        },

        // Is the account active or blocked by admin?
        isActive: {
            type: Boolean,
            default: true
        },

        aadhaarVerified: {
            type: Boolean,
            default: false
        },

        ward: {
            type: String,
            trim: true   // Removes accidental spaces: "  Ward 12  " → "Ward 12"
        },
        // When did the user last log in?
        lastLogin: {
            type: Date
        }
    },

    // ─────────────────────────────────────────
    // SCHEMA OPTIONS
    // ─────────────────────────────────────────
    {
        // timestamps: true automatically adds:
        // createdAt - when the document was created
        // updatedAt - when it was last modified
        // You don't need to define these manually
        timestamps: true
    }
);

// ─────────────────────────────────────────
// STEP 2: MIDDLEWARE (Pre-save Hook)
// This runs automatically BEFORE saving to DB
// Perfect place to hash the password
// ─────────────────────────────────────────
// CORRECT - pure async, no next parameter
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;                          // ← just return, no next()
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
                                     // ← nothing needed at the end
});

// ─────────────────────────────────────────
// STEP 3: INSTANCE METHODS
// Custom methods available on every User document
// ─────────────────────────────────────────

// Compare entered password with stored hashed password
// Used during login
userSchema.methods.comparePassword = async function (enteredPassword) {
    // bcrypt.compare handles the hashing internally
    // Returns true if passwords match, false otherwise
    return await bcrypt.compare(enteredPassword, this.password);
};

// ─────────────────────────────────────────
// STEP 4: CREATE THE MODEL
// Model = a class that lets us interact with the collection
// 'User' → MongoDB creates a collection named 'users' (auto-pluralized)
// ─────────────────────────────────────────

const User = mongoose.model('User', userSchema);

module.exports = User;