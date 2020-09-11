import { h } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { PayPalButtonsProps } from '../types';

export default function PaypalButtons(props: PayPalButtonsProps) {
    const { style, onInit, onComplete, onClick, onCancel, onError, onSubmit, paypalRef } = props;
    const paypalButtonRef = useRef(null);
    const creditButtonRef = useRef(null);

    const createButton = (fundingSource, buttonRef) => {
        const button = paypalRef.Buttons({
            fundingSource,
            style,
            onInit,
            onClick,
            onCancel,
            onError,
            createOrder: onSubmit,
            onApprove: onComplete
        });

        if (button.isEligible()) {
            button.render(buttonRef.current);
        }
    };

    useEffect(() => {
        const { PAYPAL, CREDIT } = paypalRef.FUNDING;
        createButton(PAYPAL, paypalButtonRef);
        createButton(CREDIT, creditButtonRef);
    }, []);

    return (
        <div className="adyen-checkout__paypal__buttons">
            <div className="adyen-checkout__paypal__button adyen-checkout__paypal__button--paypal" ref={paypalButtonRef} />
            <div className="adyen-checkout__paypal__button adyen-checkout__paypal__button--credit" ref={creditButtonRef} />
        </div>
    );
}