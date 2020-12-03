import { h } from 'preact';
import UIElement from '../UIElement';
import BacsInput from './components/BacsInput';
import CoreProvider from '../../core/Context/CoreProvider';
import PayButton from '../internal/PayButton';
import BacsResult from './components/BacsResult';

interface BacsElementData {
    paymentMethod: {
        type: string;
        holderName: string;
        bankAccountNumber: string;
        bankLocationId: string;
    };
    shopperEmail: string;
    billingAddress: object; // TODO - this should not be necessary for the b/e
}

class BacsElement extends UIElement {
    public static type = 'directdebit_GB';

    constructor(props) {
        super(props);
        this.state.status = 'edit-data';
    }

    formatData(): BacsElementData {
        return {
            paymentMethod: {
                type: BacsElement.type,
                ...(this.state.data?.holderName && { holderName: this.state.data.holderName }),
                ...(this.state.data?.bankAccountNumber && { bankAccountNumber: this.state.data.bankAccountNumber }),
                ...(this.state.data?.bankLocationId && { bankLocationId: this.state.data.bankLocationId })
            },
            ...(this.state.data?.shopperEmail && { shopperEmail: this.state.data.shopperEmail }),
            // TODO - billingAddress should not be necessary in order for the /payments endpoint to accept the payment
            billingAddress: {
                street: 'Infinite Loop',
                postalCode: '95014',
                city: 'Cupertino',
                houseNumberOrName: '1',
                country: 'US',
                stateOrProvince: 'CA'
            }
        };
    }

    get isValid(): boolean {
        return !!this.state.isValid;
    }

    preSubmit(e, revertToEdit) {
        // Send back to input stage ('edit' button pressed in BacsInput comp)
        if (revertToEdit === true) {
            this.setState({ status: 'enter-data' });
            this.setStatus('enter-data'); // tell component

            // Nasty hack! Needed when component is in Dropin
            // If we're coming back to the "enter-data" page then the checkboxes must have been checked - so re-check them
            // setTimeout(() => {
            //     Array.prototype.slice
            //         .call(document.querySelectorAll('.adyen-checkout__bacs .adyen-checkout__input--consentCheckbox'))
            //         .forEach(item => {
            //             item.checked = true;
            //         });
            // }, 0);
            return;
        }

        if (!this.isValid) {
            this.showValidation();
            return false;
        }

        const isConfirmationStage = e.currentTarget.className.includes('confirm-data');

        // Send to confirmation stage
        if (!isConfirmationStage) {
            this.setState({ status: 'confirm-data' });
            this.setStatus('confirm-data');
            return;
        }

        super.submit();
    }

    public payButton = props => {
        return <PayButton {...props} amount={this.props.amount} classNameModifiers={[this.state.status]} onClick={this.preSubmit.bind(this)} />;
    };

    render() {
        if (this.props.url) {
            return (
                <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                    {/*This would be the pdf download*/}
                    <BacsResult
                        ref={ref => {
                            this.componentRef = ref;
                        }}
                        icon={this.icon}
                        url={this.props.url}
                        paymentMethodType={this.props.paymentMethodType}
                    />
                </CoreProvider>
            );
        }
        // console.log('### BacsDD::render:: this.state.status=', this.state.status);
        return (
            <CoreProvider i18n={this.props.i18n} loadingContext={this.props.loadingContext}>
                <BacsInput
                    ref={ref => {
                        this.componentRef = ref;
                    }}
                    {...this.props}
                    onChange={this.setState}
                    onEdit={this.preSubmit.bind(this)}
                    payButton={this.payButton}
                />
            </CoreProvider>
        );
    }
}

export default BacsElement;
