import {
  useApi,
  reactExtension,
  useApplyNoteChange,
  TextField,
  useMetafield,
} from '@shopify/ui-extensions-react/checkout';
import { useEffect, useState } from 'react';

export default reactExtension(
  "purchase.checkout.shipping-option-item.details.render",
  () => <Extension />,
);


function Extension() {
const { deliveryGroups, query } = useApi();
const d_instructions =  useMetafield({
  namespace: "upsell_delivery_instructions",
  key: "is_delivery_instructions_checked",
})
const noteApi = useApplyNoteChange()
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

console.log('====================================');
console.log(d_instructions, "Delievery instruction metafield");
console.log('====================================');
const handleShippingChange = (val) => {
  setShippingAccountInfo(val);
};


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
  {/* {
  includeDeliveryInstructions && */}
    <TextField
      label="Delivery Instruction: Do we need a security code or call box number?"
      name="delivery-instruction"
      value={shippingAccountInfo}
      onChange={(str) => handleShippingChange(str)}
    />
  {/* } */}
  </>
);
}