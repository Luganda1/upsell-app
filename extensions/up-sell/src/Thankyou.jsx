import {
  Banner,
  useApi,
  useTranslate,
  reactExtension,
  useNote,
  Text,
  useOrder,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  "purchase.thank-you.customer-information.render-after",
  () => <Extension />,
);

function Extension() {
  const note = useNote()


  return (
    <Banner title="Delivery Instruction" status='warning' >
      <Text>
        {note}
      </Text>
    </Banner>
  );
}