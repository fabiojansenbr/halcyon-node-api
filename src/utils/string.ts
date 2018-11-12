export const format = (value: string, obj: any) => {
    let result = value;

    for (const key of Object.keys(obj)) {
        result = result.replace(new RegExp(`\{${key}\}`, 'g'), obj[key]);
    }

    return result;
};
