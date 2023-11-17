import {
  Box,
  Button,
  Card,
  Divider,
  HorizontalGrid,
  MediaCard,
  Page,
  Select,
  Text,
  VerticalStack,
  useBreakpoints,
  Toast,
  Frame,
} from "@shopify/polaris";
import { useState, useCallback } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import SearchBar from "~/Components/SearchBar";
import Emptystate from "~/Components/Emptystate";

const sampledata = {
  title: "Sample Product - Snowboard Bindings",
  description: `
    This is a sample description of the snowboard binding: thermoformed EVA bushings provide vibration-damping shock absorption 
    to save your heels while promoting true and even board flex`,
  handle: "union-str-snowboard-bindings-2023",
  image:
    "https://shoprunner-checkout-extension-ui.myshopify.com/cdn/shop/files/1.png?v=1694730980&width=990",
  price: 140,
  id: "gid://shopify/Product/8569393873173",
};

/**
 * This uses the loader function to query the admin API for all the collections
 * then it filters these collections to get the one we want to display to customers
 * So all the products in these categories are displayed in the dropdown
 */
export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
      query collections($first: Int!) {
      collections(first: $first) {
        nodes {
          id
          handle
          title
          products(first: 10) {
            nodes {
              handle
              id
              vendor
              title
              description(truncateAt: 250)
              images(first: 2) {
                nodes {
                  url
                }
              }
              variants(first: 4) {
                nodes {
                  id
                  title
                  price 
                }
              }
            }
          }
        }
      }
    }
    `,
    {
      variables: { first: 8 },
    }
  );

  const responseJson = await response.json();

  return json({
    collections: responseJson.data?.collections?.nodes,
    shop: session.shop.replace(".myshopify.com", ""),
  });
};

export async function action({ request }) {
  const { admin } = await authenticate.admin(request);
  try {
    /**
     * we are creating Metaobject mutation definition using a custom namespace that
     * and we tying to the app that way we can just define it on the app and not the
     * any thing else like product or order like metafield
     */
    const metaobjectDef = await admin.graphql(
      `#graphql 
      mutation($input: MetaobjectDefinitionCreateInput!) {
        metaobjectDefinitionCreate(definition: $input) {
          metaobjectDefinition {
            id
            type
            displayNameKey
            fieldDefinitions {
              key
              type {
                name
              }
            }
          }
        }
      }
    `,
      {
        variables: {
          input: {
            type: "app_pre_purchase",
            name: "$app:pre_purchase",
            displayNameKey: "title",
            access: {
              admin: "PUBLIC_READ_WRITE",
              storefront: "PUBLIC_READ",
            },
            capabilities: {
              publishable: { enabled: true },
              translatable: { enabled: true },
            },
            fieldDefinitions: [
              { key: "title", name: "Title", type: "single_line_text_field" },
              {
                key: "prod_id",
                name: "Product Id",
                type: "single_line_text_field",
              },
            ],
          },
        },
      }
    );
    const metaobjectDefResponse = await metaobjectDef.json();
    return metaobjectDefResponse;
  } catch (error) {
    throw new Response(`${error} MUTATION DEFINITION ERROR`, { status: 404 });
  } finally {
    /**
     * This is used to create meta object mutation that saves the selected product
     * to the shopify app object so we can use it in the UI extension to display
     * in the checkout for pre-purhcase marketing
     */
    const formData = new URLSearchParams(await request.text());
    const productTitle = formData.get("title");
    const productId = formData.get("id");
    const response = await admin.graphql(
      `#graphql
    mutation metaobjectCreate($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
            metaobject {
              id
              displayName
              capabilities {
                publishable {
                    status
                  }
                }
              type
              title: field(key: "title") { value }
              prod_id: field(key: "prod_id") { value }
            }
            userErrors {
              field
              message
            }
          }
      }
      
    `,
      {
        variables: {
          metaobject: {
            type: "app_pre_purchase",
            capabilities: {
              publishable: {
                status: "ACTIVE",
              },
            },
            fields: [
              {
                key: "title",
                value: productTitle,
              },
              {
                key: "prod_id",
                value: productId,
              },
            ],
          },
        },
      }
    );
    const responseJson = await response.json();
    return responseJson;
  }
}

export default function AdditionalPage() {
  const { smUp } = useBreakpoints();
  const nav = useNavigation();
  const [selected, setSelected] = useState("Select a product");
  const [selectedCollection, setSelectedCollection] = useState("Home page");
  const [selectedProduct, setSelectedProduct] = useState(sampledata);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [toastActive, setToastActive] = useState(false);
  const { collections, shop } = useLoaderData();
  const submit = useSubmit();

  const toggleActive = useCallback(
    () => setToastActive((toastActive) => !toastActive),
    []
  );

  const filteredCollection = collections.filter(
    (item) => item.title === selectedCollection
  );

  const collectionOptions = collections.map((item) => {
    return {
      label: item.title,
      value: item.title,
    };
  });

  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

  const handleSubmit = () => {
    submit(selectedProduct, { replace: true, method: "POST" });
  };

  /**
   * Map thru the different product object to return an array of object labels and id values for the select
   */
  const productOptions = filteredCollection[0].products.nodes.map((item) => {
    return {
      label: item.title,
      value: item.id,
    };
  });

  const handleCollectionSelection = useCallback(
    async (value) => {
      const val = await value;
      setSelectedCollection(val);
    },
    [selectedCollection]
  );

  const handleSelectChange = useCallback(
    async (value) => {
      try {
        const productId = await value;
        setSelected(productId);
        setIsButtonDisabled(false);
        const selectProd = filteredCollection[0].products.nodes.filter(
          (item) => item.id === productId
        );

        // Check if selectProd has items before attempting to access properties
        if (selectProd.length > 0) {
          const product = selectProd[0];

          // Safely access deeper nested properties
          const imageUrl =
            product.images && product.images.nodes && product.images.nodes[0]
              ? product.images.nodes[0].url
              : null;
          const variantId =
            product.variants &&
            product.variants.nodes &&
            product.variants.nodes[0]
              ? product.variants.nodes[0].id
              : null;
          const price =
            product.variants &&
            product.variants.nodes &&
            product.variants.nodes[0]
              ? product.variants.nodes[0].price
              : null;
          const prodObj = {
            title: product.title,
            id: product.id,
            vendor: product.vendor,
            description: product.description,
            handle: product.handle,
            image: imageUrl,
            variantId: variantId,
            price: price,
          };

          setSelectedProduct(prodObj);
        } else {
          console.error("No product found with the given ID:", productId);
        }
      } catch (error) {
        console.error("Error in handleSelectChange:", error);
      }
    },
    [selected, selectedProduct]
  );

  return (
    <Frame>
      <Page
        divider
        title="Pre-Purchase product "
        primaryAction={
          <>
            <Button
              loading={isLoading}
              disabled={isButtonDisabled}
              primary
              onClick={() => {
                handleSubmit();
                toggleActive();
              }}
            >
              Submit product
            </Button>
            {toastActive && (
              <Toast
                content="Successfully submitted"
                onDismiss={toggleActive}
              />
            )}
          </>
        }
        secondaryActions={[
          {
            content: "Products dashboard",
            accessibilityLabel:
              "This button will take you to products dashboard",
            target: "_blank",
            external: true,
            disabled: isButtonDisabled,
            url: `https://admin.shopify.com/store/${shop}/admin/products/${extractProductId(
              selectedProduct.id
            )}`,
            onAction: () => {},
          },
        ]}
      >
        <VerticalStack gap={{ xs: "8", sm: "4" }}>
          <HorizontalGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="4">
            <Box
              as="section"
              paddingInlineStart={{ xs: 4, sm: 0 }}
              paddingInlineEnd={{ xs: 4, sm: 0 }}
            >
              <VerticalStack gap="4">
                <Text as="h3" variant="headingMd">
                  Collections
                </Text>
                <Text as="p" variant="bodyMd">
                  Select a category that will be passed in for the product
                </Text>
              </VerticalStack>
            </Box>
            <Card roundedAbove="sm">
              <VerticalStack gap="4">
                <SearchBar
                  options={collectionOptions}
                  onChange={handleCollectionSelection}
                />
              </VerticalStack>
            </Card>
          </HorizontalGrid>
          {smUp ? <Divider /> : null}
          {selectedCollection === "Home page" ? (
            <Emptystate shop={shop} />
          ) : (
            <>
              <HorizontalGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="4">
                <Box
                  as="section"
                  paddingInlineStart={{ xs: 4, sm: 0 }}
                  paddingInlineEnd={{ xs: 4, sm: 0 }}
                >
                  <VerticalStack gap="4">
                    <Text as="h3" variant="headingMd">
                      Products
                    </Text>
                    <Text as="p" variant="bodyMd">
                      Select a product that you want to showup on the checkout
                      page under the Pre-sale banner. Whichever product you
                      select here will be displayed on the checkout presale
                      banner.
                    </Text>
                  </VerticalStack>
                </Box>
                <Card roundedAbove="sm">
                  <VerticalStack gap="4">
                    <Select
                      label="Select a Product"
                      options={productOptions}
                      onChange={handleSelectChange}
                      value={selected}
                    />
                  </VerticalStack>
                </Card>
              </HorizontalGrid>
              {smUp ? <Divider /> : null}
              <HorizontalGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="4">
                <Box
                  as="section"
                  paddingInlineStart={{ xs: 4, sm: 0 }}
                  paddingInlineEnd={{ xs: 4, sm: 0 }}
                >
                  <VerticalStack gap="4">
                    <Text as="h3" variant="headingMd">
                      {`You selected `}
                    </Text>
                  </VerticalStack>
                </Box>
                <VerticalStack gap="4">
                  <MediaCard
                    title={selectedProduct?.title}
                    size="medium"
                    primaryAction={{
                      content: "Go to product page",
                      url: `https://${shop}.myshopify.com/products/${selectedProduct?.handle}`,
                      target: "_blank",
                      external: true,
                      disabled: isButtonDisabled,
                      accessibilityLabel: `${selectedProduct?.title}`,
                      onAction: () => {},
                    }}
                    description={selectedProduct?.description}
                    popoverActions={[
                      { content: "Dismiss", onAction: () => {} },
                    ]}
                  >
                    <img
                      alt=""
                      width="100%"
                      height="100%"
                      style={{
                        objectFit: "cover",
                        objectPosition: "fill",
                      }}
                      src={selectedProduct?.image}
                    />
                  </MediaCard>
                </VerticalStack>
              </HorizontalGrid>
            </>
          )}
        </VerticalStack>
      </Page>
    </Frame>
  );

  function extractProductId(productId) {
    const match = productId.match(/(\d+)$/);
    return match ? match[1] : "";
  }
}
