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
  useCartLines,
  useTotalAmount,
  Banner,
  Link,
  Modal,
  Grid,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension(
  "purchase.checkout.cart-line-list.render-after",
  () => <Extension />
);

function Extension() {
  const [data, setData] = useState();
  const { query } = useApi();
  const CartLineAddChange = useApplyCartLinesChange();
  const cartLineItems = useCartLines();
  const [selectedProduct, setSelectedProduct] = useState();
  const [prePurchaseId, setPrePurchaseId] = useState(
    "gid://shopify/Product/8569393873173"
  );
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

  // const hasMatchingId = cartLineItems.some(
  //   (item) =>
  //     item.merchandise.id === "gid://shopify/ProductVariant/46322009702677"
  // );

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

  // if (totalCartAmount.amount < 1000) {
  //   if (hasMatchingId) {
  //     return (
  //       <Banner>
  //         <Text>
  //           This item already exist click here to choose another item{" "}
  //         </Text>
  //         <Link
  //           overlay={
  //             <Modal id="my-modal" padding title="Products ">
  //               <Grid columns={["33.3%", "33.3%", "33.3%"]} spacing="loose">
  //                 {data?.products?.nodes.map((node) => (
  //                   <Link
  //                     to={`https://shoprunner-checkout-extension-ui.myshopify.com/products/${node.handle}`}
  //                   >
  //                     <View border="base" padding="base">
  //                       <View>
  //                         <Image
  //                           source={node.images.edges[0].node.url}
  //                           aspectRatio={1}
  //                           fit="contain"
  //                         />
  //                         <Text>{node.title}</Text>

  //                         <Text emphasis="bold" accessibilityRole="address">
  //                           $ {node.variants.edges[0].node.price.amount}
  //                         </Text>
  //                       </View>
  //                     </View>
  //                   </Link>
  //                 ))}
  //               </Grid>
  //               <Button onPress={() => ui.overlay.close("my-modal")}>
  //                 Close
  //               </Button>
  //             </Modal>
  //           }
  //         >
  //           All Products
  //         </Link>
  //       </Banner>
  //     );
  //   } 
  //     return (
  //       <>
  //         <Banner status="warning">
  //           <Text size="large">
  //             {`You are just $${(1000 - totalCartAmount.amount).toFixed(
  //               2
  //             )} from getting 80% off pre-selected items `}
  //           </Text>
  //               {"   "}
  //           <Link
  //             overlay={
  //               <Modal id="my-modal" padding title="Products ">
  //                 <Grid columns={["33.3%", "33.3%", "33.3%"]} spacing="loose">
  //                   {data?.products?.nodes.map((node) => (
  //                     <Link
  //                       to={`https://shoprunner-checkout-extension-ui.myshopify.com/products/${node.handle}`}
  //                     >
  //                       <View border="base" padding="base">
  //                         <View>
  //                           <Image
  //                             source={node.images.edges[0].node.url}
  //                             aspectRatio={1}
  //                             fit="contain"
  //                           />
  //                           <Text>{node.title}</Text>

  //                           <Text emphasis="bold" accessibilityRole="address">
  //                             $ {node.variants.edges[0].node.price.amount}
  //                           </Text>
  //                         </View>
  //                       </View>
  //                     </Link>
  //                   ))}
  //                 </Grid>
  //                 <Button onPress={() => ui.overlay.close("my-modal")}>
  //                   Close
  //                 </Button>
  //               </Modal>
  //             }
  //           >
  //             All Products
  //           </Link>
  //         </Banner>
  //       </>
  //     );
  // } 
    return (
      <>
        {data?.products?.nodes.map(
          (node) =>
            node.id === prePurchaseId && (
              <>
              <Heading level={2} inlineAlignment="start">You may also like </Heading>
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
                    $ {node.variants.edges[0].node.price.amount}
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
