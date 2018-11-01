import * as password from './password';
import * as refreshToken from './refreshToken';
import * as external from './external';
import * as twoFactor from './twoFactor';

const handlers = {
    Password: password,
    RefreshToken: refreshToken,
    External: external,
    TwoFactor: twoFactor
};

export default handlers;
