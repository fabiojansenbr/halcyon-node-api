import fetch from 'node-fetch';

export const get = async <T>(url: string) => {
    const response = await fetch(url);
    const result = await response.json();
    return result as T;
};
