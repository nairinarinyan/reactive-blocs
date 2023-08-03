export const isPlainObject = (obj: any) =>
    typeof obj === 'object' &&
        obj !== null &&
        obj.constructor === Object

export const compare = (obj1: any, obj2: any) =>
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every(key => obj2.hasOwnProperty(key) && obj1[key] === obj2[key]);

export const generateId = () => Math.round(Math.random() * 1e10).toString(16);
