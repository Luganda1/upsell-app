import {
  reactExtension,
  BlockStack,
  InlineStack,
  Button,
  Image,
  Text,
  useTarget,
  Banner,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  
  () => <Extension />,
);

function Extension() {
  const {
    merchandise
  } = useTarget();
  // const image = merchandise.image?.url ?? "https://www.google.com/url?sa=i&url=https%3A%2F%2Ftineye.com%2Fpress&psig=AOvVaw2s4k95xsCWuzHPLG-_N3-x&ust=1694554969329000&source=images&cd=vfe&opi=89978449&ved=0CA8QjRxqFwoTCIDU7qvDo4EDFQAAAAAdAAAAABAD";
  return (
    <InlineStack spacing="base">
      <BlockStack>
        <Text size="large">Title: {merchandise.title}</Text>
        <Text size="small">Vendor: {merchandise.product.vendor}</Text>
      </BlockStack>
    </InlineStack>
  );
}
