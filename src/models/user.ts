import mongoose from 'mongoose';
import * as crypto from 'crypto';
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    emailAddress: { type: String, required: true, max: 254, unique: true },
    password: { type: String, max: 128 },
    firstName: { type: String, required: true, max: 50 },
    lastName: { type: String, required: true, max: 50 },
    dateOfBirth: { type: Date, required: true },
    search: { type: String, max: 354 },
    passwordResetToken: { type: String, max: 32 },
    verifyEmailToken: { type: String, max: 32 },
    roles: { type: [String] },
    emailConfirmed: { type: Boolean },
    isLockedOut: { type: Boolean },
    twoFactorEnabled: { type: Boolean },
    twoFactorSecret: { type: String, max: 16 },
    twoFactorTempSecret: { type: String, max: 16 },
    refreshTokens: [
        {
            token: { type: String, required: true, max: 32 },
            issued: { type: Date, required: true }
        }
    ],
    logins: [
        {
            provider: { type: String, required: true, max: 50 },
            externalId: { type: String, required: true, max: 50 }
        }
    ]
});

UserSchema.virtual('gravatarUrl').get(function() {
    const hash = crypto
        .createHash('md5')
        .update(this.emailAddress)
        .digest('hex');

    return `https://secure.gravatar.com/avatar/${hash}?d=mm`;
});

UserSchema.pre('save', function(next) {
    this.search = `${this.firstName} ${this.lastName} ${this.emailAddress}`;
    next();
});

// UserSchema.index({ '$**': 'text' });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
