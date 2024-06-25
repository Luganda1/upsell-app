import {
Checkbox, 
LegacyStack,
Button,
Collapsible,
Text,
Link,
LegacyCard} from '@shopify/polaris';
import {useState, useCallback} from 'react';

export default function DeliveryCheckbox({checked, handleDeliveryCheckboxChange}) {
    const [open, setOpen] = useState(false);

    const handleToggle = useCallback(() => setOpen((open) => !open), []);
    return (
    <>
        <LegacyCard sectioned title="Delivery Instructions">
            <LegacyStack alignment="center">
            <LegacyStack.Item fill>
                <Checkbox
                label="Check the box to include the delivery instruction feature "
                checked={checked}
                onChange={handleDeliveryCheckboxChange}
                />
            </LegacyStack.Item>
            <Button
            variant="primary"
            onClick={handleToggle}
            ariaExpanded={open}
            ariaControls="basic-collapsible"
        >
            Learn More
        </Button>
        <Collapsible
            open={open}
            id="basic-collapsible"
            transition={{duration: '500ms', timingFunction: 'ease-in-out'}}
            expandOnPrint
        >
            <Text variant="bodyMd" as="p">
            <p>
                By clicking this button, you will activate the shipping instruction functionality 
                that appears during the checkout process in the shipping methods section. This 
                feature is designed to assist customers in providing more specific details regarding 
                their delivery preferences. It is utilized to provide delivery personnel with instructions 
                on how to deliver the package or specify the delivery location.
            </p>
            </Text>
        </Collapsible>
            </LegacyStack>
        </LegacyCard>
        
    </>
    );
}



