import { email } from '../../../utils/regex';

const phoneNumberRegEx = /^[+]*[0-9]{1,4}[\s/0-9]*$/;

export const bacsValidationRules: object = {
    input: {
        telephoneNumber: (num): object => {
            // Format
            const regEx = /[^0-9+\s]/g;
            const formattedVal: string = num.replace(regEx, '');
            // Validate
            const isValid: boolean = phoneNumberRegEx.test(formattedVal) && formattedVal && formattedVal.length >= 7;

            return { isValid, value: formattedVal, showError: false };
        },
        shopperEmail: value => {
            return { isValid: email.test(value), errorMessage: true };
        },
        default: (value): boolean => value && value.length > 0
    },
    blur: {
        telephoneNumber: (num): object => {
            // Just validate
            return { isValid: phoneNumberRegEx.test(num) && num && num.length >= 7, value: num, showError: true };
        },
        shopperEmail: value => {
            return { isValid: email.test(value), errorMessage: true };
        },
        default: (value): boolean => value && value.length > 0
    }
};
