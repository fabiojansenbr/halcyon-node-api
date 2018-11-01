import uuidv4 from 'uuid/v4';

const userToken = () => uuidv4().replace(/-/giu, '');

export default userToken;
