import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    dob: {
      type: Date
    },
    about: {
      type: String,
      trim: true
    },
    phoneNumber: {
      type: String,
      trim: true
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format']
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    avatar: {
      type: String
    },
    role: {
      type: String,
      enum: ['ADMIN', 'INSTRUCTOR', 'STUDENT'],
      default: 'STUDENT'
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
      }
    ],
    courseProgress: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseProgress'
      }
    ],
    profile: profileSchema
  },
  {
    timestamps: true
  }
);

userSchema.pre('save', function saveUser(next) {
  if (!this.avatar) {
    this.avatar = `https://ui-avatars.com/api/?name=${this.firstName}+${this.lastName}&background=0D8ABC&color=fff`;
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User;
