import { useEffect, useState } from "react";
import {
  useApi,
  reactExtension,
  InlineLayout,
  View,
  Image,
  Text,
  Heading,
  Button,
  Divider,
  useApplyCartLinesChange,
  useApplyMetafieldsChange,
  useAppMetafields,
} from "@shopify/ui-extensions-react/checkout";


export default reactExtension(
  "purchase.checkout.cart-line-list.render-after",
  () => <Extension />
);

function Extension() {
  const [data, setData] = useState();
  const initialId = "gid://shopify/Product/8569393873173"
  const initialBannerTitle = "You may also like ";
  const { query } = useApi();
  const AppMetafieldFilters = useAppMetafields({
    id: "[secret]",
    type: "shop",
    namespace: "upsell_delivery_instructions",
    key: "is_delivery_instructions_checked",
  })
  const CartLineAddChange = useApplyCartLinesChange();
  const DeliveryInstructionsMetafieldUpdated = useApplyMetafieldsChange()
  const [deliveryInstructions, setDeliveryInstructions] = useState("false")
  const [selectedProduct, setSelectedProduct] = useState();
  const [prePurchaseId, setPrePurchaseId] = useState(initialId);
  const [bannerTitle, setBannerTitle] = useState(initialBannerTitle)

  useEffect(() => {
    query(
      `query ($first: Int!) {
      products(first: $first) {
    nodes {
      id
      title
      handle
      tags
      vendor
      images(first: 5) {
        edges {
          node {
            url
          }
        }
      }
      variants(first: 5) {
        edges {
          node {
            id
            title
            price {
              amount
            }
          }
        }
      }
    }
  }
      }`,
      {
        variables: { first: 250 },
      }
    )
      .then(({ data }) => setData(data))
      .catch((error) => error.message);
  }, [query]);

  //Getting the mechant selected product from the admin dashboard
  useEffect(() => {
    query(`
  query {
    metaobjects(type: "app_pre_purchase", first: 250) {
      nodes {
        handle
        type
        updatedAt
        title: field(key: "title") { value }
        prod_id: field(key: "prod_id") { value },
      }
    }
  }
  `)
      .then(({ data }) => setSelectedProduct(data))
      .catch((error) => error.message);
  }, [query]);

  //Getting the mechant settings to change the banner title from the admin dashboard
  useEffect(() => {
    query(`
      query {
        metaobjects(type: "app_pre_purchase_settings", first: 250) {
          nodes {
            handle
            type
            updatedAt
            banner_title: field(key: "banner_title") { value }
            d_instructions: field(key: "d_instructions") { value }
          }
        }
      }
      `)
      .then(({ data }) => {
        const title = data.metaobjects?.nodes[0].banner_title.value
        const delivery_instructions = data.metaobjects?.nodes[0].d_instructions.value
        setBannerTitle(title)
        setDeliveryInstructions(delivery_instructions)
        return
      })
      .catch((error) => error.message);
  }, [query]);

  // It handles all the logic for adding the product to cart
  const handdleProductAdded = async (node) => {
    const productVariantId = extractLastNumbers(node.variants.edges[0].node.id);
    await CartLineAddChange({
      type: "addCartLine",
      merchandiseId: `gid://shopify/ProductVariant/${productVariantId}`,
      quantity: 1,
      attributes: [{ key: "Vendor", value: `${node.vendor}` }],
    });
  };

  // This will update the delivery metafield and then will be able to use it on the other checkout page
  (async() => {
    await DeliveryInstructionsMetafieldUpdated({
      type: "updateMetafield",
      key: "is_delivery_instructions_checked",
      namespace: "upsell_delivery_instructions",
      value: deliveryInstructions,
      valueType: "string"
    })
  })()
console.log('====================================');
console.log(deliveryInstructions, "Delivery Instruction");
console.log(bannerTitle)
console.log(AppMetafieldFilters)
console.log('====================================');
  useEffect(() => {
    (async function returnSelectedProductId(data) {
      const newData = await data;
      // Sort the nodes by updatedAt in descending order
      const sortedNodes = newData?.metaobjects?.nodes.sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt)
      );
      // Return the prod_id of the most recently updated node
      const mostRecentProdId = sortedNodes[0].prod_id.value;
      setPrePurchaseId(mostRecentProdId);
    })(selectedProduct);
  }, [selectedProduct]);

    return (
      <>
        {data?.products?.nodes.map(
          (node) =>
            node.id === prePurchaseId && (
              <>
              <Heading level={2} inlineAlignment="start">{bannerTitle}</Heading>
              <InlineLayout
                key={node.id}
                columns={["20%", "60%", "auto"]}
                border="base"
                borderRadius="base"
              >
                <View>
                  <Image source={node.images.edges[0].node.url} />
                </View>
                <View border="none" padding="base" display="block">
                  <Heading>{node.title} </Heading>
                  <Text>Vendor: {node.vendor} </Text>
                  <Divider size="small" alignment="center" />
                  <Text size="large" emphasis="bold">
                    $ {node.variants.edges[0].node.price.amount}0
                  </Text>
                </View>
                <View border="none" padding="base">
                  <Button onPress={() => handdleProductAdded(node)}>Add</Button>
                </View>
              </InlineLayout>
              </>
            )
        )}
      </>
    );
  

  // This regex function destructures the product variant id to get the real id number
  function extractLastNumbers(id) {
    const regex = /(\d+)$/;
    const match = id.match(regex);
    if (match) {
      return match[1];
    } else {
      return null;
    }
  }
}
