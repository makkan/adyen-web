import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import classNames from 'classnames';
import useCoreContext from '../../../core/Context/useCoreContext';
import Field from '../../internal/FormFields/Field';
import { renderFormField } from '../../internal/FormFields';
import ConsentCheckbox from '../../internal/FormFields/ConsentCheckbox';
import { bacsValidationRules } from './validate';
import Validator from '../../../utils/Validator';
import { BacsDataState, BacsErrorsState, BacsInputProps, BacsValidState, ValidationObject } from './types';
import './BacsInput.scss';

function BacsInput(props: BacsInputProps) {
    const { i18n } = useCoreContext();
    const validator: Validator = new Validator(bacsValidationRules);

    const [data, setData] = useState<BacsDataState>(props.data);
    const [errors, setErrors] = useState<BacsErrorsState>({});
    const [valid, setValid] = useState<BacsValidState>({
        ...(props.data.holderName && {
            holderName: validator.validate('holderName', 'input')(props.data.holderName)
        }),
        ...(props.data.bankAccountNumber && {
            bankAccountNumber: validator.validate('bankAccountNumber', 'input')(props.data.bankAccountNumber).isValid
        }),
        ...(props.data.bankLocationId && {
            bankLocationId: validator.validate('bankLocationId', 'input')(props.data.bankLocationId).isValid
        }),
        ...(props.data.shopperEmail && {
            shopperEmail: validator.validate('shopperEmail', 'input')(props.data.shopperEmail).isValid
        })
    });

    const [status, setStatus] = useState('ready');

    this.setStatus = newStatus => {
        setStatus(newStatus);
    };

    this.showValidation = (): void => {
        setErrors({
            holderName: !validator.validate('holderName', 'blur')(data.holderName).isValid,
            bankAccountNumber: !validator.validate('bankAccountNumber', 'blur')(data.bankAccountNumber).isValid,
            // bankLocationId: !validator.validate('bankLocationId', 'blur')(data.bankLocationId).isValid,
            shopperEmail: !validator.validate('shopperEmail', 'blur')(data.shopperEmail).isValid
        });
    };

    const handleEventFor = (key: string, mode: string) => (e: Event): void => {
        const val: string = (e.target as HTMLInputElement).value;
        const { value, isValid, showError }: ValidationObject = validator.validate(key, mode)(val);

        setData({ ...data, [key]: value });
        setErrors({ ...errors, [key]: !isValid && showError });
        setValid({ ...valid, [key]: isValid });
    };

    // const handleConsentCheckbox = e => {
    //     const { checked } = e.target;
    //     setData(prevData => ({ ...prevData, consentCheckbox: checked }));
    //     setValid(prevValid => ({ ...prevValid, consentCheckbox: checked }));
    //     setErrors(prevErrors => ({ ...prevErrors, consentCheckbox: !checked }));
    // };
    const handleConsentCheckbox = (key: string) => (e): void => {
        const { checked } = e.target;

        const consentKey = key + 'ConsentCheckbox';

        setData(prevData => ({ ...prevData, [consentKey]: checked }));
        setValid(prevValid => ({ ...prevValid, [consentKey]: checked }));
        setErrors(prevErrors => ({ ...prevErrors, [consentKey]: !checked }));
    };

    useEffect(() => {
        props.onChange({ data, isValid: valid.holderName && valid.bankAccountNumber && valid.shopperEmail });
    }, [data, valid]);

    return (
        <div className="adyen-checkout__mb-way">
            <Field
                className={'adyen-checkout__field--owner-name'}
                label={i18n.get('bacs.holderName')}
                errorMessage={errors.holderName ? i18n.get('bacs.holderName.invalid') : false}
                isValid={valid.holderName}
            >
                {renderFormField('text', {
                    name: 'bacs.holderName',
                    className: 'adyen-checkout__iban-input__owner-name',
                    placeholder: props.placeholders.holderName,
                    value: data.holderName,
                    // 'aria-invalid': !!this.state.errors.holder,
                    // 'aria-label': i18n.get('sepa.ownerName'),
                    onChange: handleEventFor('holderName', 'blur'),
                    onInput: handleEventFor('holderName', 'input')
                })}
            </Field>

            <Field
                errorMessage={!!errors.bankAccountNumber && i18n.get('bacs.accountNumberField.invalid')}
                label={i18n.get('bacs.bankAccount')}
                className={classNames('adyen-checkout__input--phone-number')}
                isValid={valid.bankAccountNumber}
            >
                {renderFormField('text', {
                    value: data.bankAccountNumber,
                    className: 'adyen-checkout__pm__phoneNumber__input',
                    placeholder: props.placeholders.bankAccountNumber,
                    required: true,
                    autoCorrect: 'off',
                    onChange: handleEventFor('bankAccountNumber', 'blur'),
                    onInput: handleEventFor('bankAccountNumber', 'input')
                })}
            </Field>

            <Field
                errorMessage={!!errors.shopperEmail && i18n.get('bacs.shopperEmail.invalid')}
                label={i18n.get('bacs.shopperEmail')}
                classNameModifiers={['shopperEmail']}
                isValid={valid.shopperEmail}
            >
                {renderFormField('emailAddress', {
                    value: data.shopperEmail,
                    name: 'shopperEmail',
                    classNameModifiers: ['large'],
                    placeholder: props.placeholders.shopperEmail,
                    spellcheck: false,
                    required: true,
                    autocorrect: 'off',
                    onInput: handleEventFor('shopperEmail', 'input'),
                    onChange: handleEventFor('shopperEmail', 'blur')
                })}
            </Field>

            <ConsentCheckbox
                data={data}
                errorMessage={!!errors.amountConsentCheckbox}
                label={i18n.get('bacsdd.consent.amount')}
                onChange={handleConsentCheckbox('amount')}
            />

            <ConsentCheckbox
                data={data}
                errorMessage={!!errors.accountConsentCheckbox}
                label={i18n.get('bacsdd.consent.account')}
                onChange={handleConsentCheckbox('account')}
            />

            {props.showPayButton && props.payButton({ status, label: i18n.get('continue') })}
        </div>
    );
}

BacsInput.defaultProps = {
    data: {},
    placeholders: {}
    // onChange: () => {}
};

export default BacsInput;