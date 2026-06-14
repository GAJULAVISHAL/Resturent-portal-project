
import Sqids from 'sqids';

export const menuHasher = new Sqids({
    alphabet: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    minLength: 16,
});