import {
  useApi,
  reactExtension,
  useApplyNoteChange,
  TextField,
} from '@shopify/ui-extensions-react/checkout';
import { useEffect, useState } from 'react';

export default reactExtension(
  "purchase.checkout.shipping-option-item.details.render",
  () => <Extension />,
);


function Extension() {
const { deliveryGroups } = useApi();
const [shippingAccountInfo, setShippingAccountInfo] = useState("");
const [selectedDeliveryOption, setSelectedDeliveryOption] = useState(null);

useEffect(() => {
  const getAccountInfo = async() => {
    // Check if deliveryGroups and deliveryGroups.current are defined, and if deliveryGroups.current has at least one item
    if (
      deliveryGroups &&
      deliveryGroups?.current &&
      deliveryGroups?.current?.length > 0
    ) {
      // Extract the handle of the selectedDeliveryOption from the first item in the current array
      const handle = await deliveryGroups.current[0].selectedDeliveryOption.handle;
      setSelectedDeliveryOption(handle);
    }
  }
  getAccountInfo()
}, [deliveryGroups]);

// console.log('====================================');
// console.log(deliveryGroups, "Deliery Group ")
// console.log(selectedDeliveryOption, "selected Delivery OPtion")
// console.log('====================================');

// Capturing the data changes in the Textfield 
const handleShippingChange = (val) => {
  setShippingAccountInfo(val);
};

const noteApi = useApplyNoteChange()

useEffect(() => {
  if (shippingAccountInfo) {
      // Updating the note API with the new data 
      const applyNote = async () => {
        await noteApi({
          type: "updateNote",
          note: shippingAccountInfo
        });
      };
  applyNote()
  }
}, [shippingAccountInfo])



return (
  <>
    <TextField
      label="Delivery Instruction: Do we need a security code or call box number?"
      name="delivery-instruction"
      value={shippingAccountInfo}
      onChange={(str) => handleShippingChange(str)}
    />
  </>
);
}