import speakeasy from 'speakeasy';

export interface ITwoFactorResponse {
    secret: string;
    authenticatorUri: string;
}

export const generate = (label: string): ITwoFactorResponse => {
    const secret = speakeasy.generateSecret({ length: 10 });
    const authenticatorUri = speakeasy.otpauthURL({
        secret: secret.base32,
        label
    });

    return {
        secret: secret.base32,
        authenticatorUri
    };
};

export const verify = (token: string, secret: string) => {
    if (!token || !secret) {
        return false;
    }

    return speakeasy.totp.verify({
        encoding: 'base32',
        token,
        secret
    });
};
