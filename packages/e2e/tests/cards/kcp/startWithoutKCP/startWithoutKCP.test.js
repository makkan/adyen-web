import { Selector, ClientFunction } from 'testcafe';
import { start, getIframeSelector } from '../../../utils/commonUtils';
import cu, { getCardIsValid } from '../../utils/cardUtils';
import kcp from '../../utils/kcpUtils';
import { KOREAN_TEST_CARD, REGULAR_TEST_CARD, TEST_PWD_VALUE, TEST_TAX_NUMBER_VALUE } from '../../utils/constants';
import { CARDS_URL } from '../../../pages';

const passwordHolder = Selector('.card-field [data-cse="encryptedPassword"]');

const getCardState = ClientFunction((what, prop) => {
    return window.card.state[what][prop];
});

const TEST_SPEED = 1;

const iframeSelector = getIframeSelector('.card-field iframe');

const cardUtils = cu(iframeSelector);
const kcpUtils = kcp(iframeSelector);

fixture`Starting without KCP fields`.page(CARDS_URL).clientScripts('startWithoutKCP.clientScripts.js');

// Pink 1
test(
    'Fill in card number that will trigger addition of KCP fields, ' +
        'then check new iframe field is correctly set up, ' +
        'then complete the form & check component becomes valid',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Fill card field with korean card
        await cardUtils.fillCardNumber(t, KOREAN_TEST_CARD);

        // Does a newly added password securedField now exist with a state.valid entry, a holder and an iframe...?
        await t
            .expect(getCardState('valid', 'encryptedPassword'))
            .eql(false)
            .expect(passwordHolder.exists)
            .ok()
            .expect(passwordHolder.find('iframe').getAttribute('src'))
            .contains('securedFields.html');

        // ...and can we can type into the iframe?
        await kcpUtils.fillPwd(t);

        // Check pwd field for value
        await kcpUtils.checkPwd(t, TEST_PWD_VALUE);

        // // Complete form
        await cardUtils.fillDateAndCVC(t);
        await kcpUtils.fillTaxNumber(t);

        // // Expect card to now be valid
        await t
            .wait(1000)
            .expect(getCardIsValid())
            .eql(true);
    }
);

// Pink 2
test(
    'Fill in card number that will trigger addition of KCP fields, ' +
        'then fill in all KCP details & check card state for taxNumber & password entries, ' +
        'then delete card number and check taxNumber and password state are cleared',
    async t => {
        // Start, allow time for iframes to load
        await start(t, 2000, TEST_SPEED);

        // Complete form with korean card number
        await cardUtils.fillCardNumber(t, KOREAN_TEST_CARD);
        await cardUtils.fillDateAndCVC(t);
        await kcpUtils.fillTaxNumber(t);
        await kcpUtils.fillPwd(t);

        // Expect card to now be valid
        await t.expect(getCardIsValid()).eql(true);

        // Expect card state to have tax and pwd elements
        await t.expect(getCardState('data', 'taxNumber')).eql(TEST_TAX_NUMBER_VALUE);
        await t.expect(getCardState('data', 'encryptedPassword')).contains('adyenjs_0_1_'); // check for blob

        await t.expect(getCardState('valid', 'taxNumber')).eql(true);
        await t.expect(getCardState('valid', 'encryptedPassword')).eql(true);

        // Delete number
        await cardUtils.deleteCardNumber(t);

        // Expect card state's tax and pwd elements to have been cleared/reset
        await t.expect(getCardState('data', 'taxNumber')).eql(undefined);
        await t.expect(getCardState('data', 'encryptedPassword')).eql(undefined);

        await t.expect(getCardState('valid', 'taxNumber')).eql(false);
        await t.expect(getCardState('valid', 'encryptedPassword')).eql(false);

        // Expect card to no longer be valid
        await t.expect(getCardIsValid()).eql(false);
    }
);

//test('Fill in card number that will not trigger addition of KCP iframe', async t => {
//    await start(t, 2000, TEST_SPEED);
//
//    // Fill card field with korean card
//    await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD);
//
//    // Should be no securedField holding element
//    await t.expect(passwordHolder.exists).notOk();
//});

// Pink 3
test(
    'Fill in card number that will trigger addition of KCP fields, ' +
        'then complete form and expect component to be valid & to be able to pay,' +
        'then replace card number with non-korean card and expect component to be valid & to be able to pay',
    async t => {
        await start(t, 2000, TEST_SPEED);

        // handler for alert that's triggered on successful payment
        await t.setNativeDialogHandler(() => true);

        // Complete form with korean card number
        await cardUtils.fillCardNumber(t, KOREAN_TEST_CARD);
        await cardUtils.fillDateAndCVC(t);
        await kcpUtils.fillTaxNumber(t);
        await kcpUtils.fillPwd(t);

        // Expect card to now be valid
        await t.expect(getCardIsValid()).eql(true);

        // click pay
        await t
            .click('.card-field .adyen-checkout__button--pay')
            // no errors
            .expect(Selector('.adyen-checkout__field--error').exists)
            .notOk();

        // Replace number with non-korean card
        await cardUtils.fillCardNumber(t, REGULAR_TEST_CARD, true);

        // Expect card to now be valid
        await t.expect(getCardIsValid()).eql(true);

        // click pay
        await t
            .click('.card-field .adyen-checkout__button--pay')
            // no errors
            .expect(Selector('.adyen-checkout__field--error').exists)
            .notOk()
            .wait(1000);
    }
);

// Pink 4
test(
    'Fill in card number that will trigger addition of KCP fields, ' +
        'then complete form except for password field,' +
        'expect component not to be valid and for password field to show error',
    async t => {
        await start(t, 2000, TEST_SPEED);

        // Complete form with korean card number
        await cardUtils.fillCardNumber(t, KOREAN_TEST_CARD);
        await cardUtils.fillDateAndCVC(t);
        await kcpUtils.fillTaxNumber(t);

        // Expect card to not be valid
        await t.expect(getCardIsValid()).eql(false);

        // click pay
        await t
            .click('.card-field .adyen-checkout__button--pay')
            // Expect error on password field
            .expect(Selector('.adyen-checkout__field--koreanAuthentication-encryptedPassword.adyen-checkout__field--error').exists)
            .ok()
            .wait(2000);
    }
);
