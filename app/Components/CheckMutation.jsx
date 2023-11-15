import React from 'react'
import { authenticate } from '~/shopify.server';

function CheckMutation() {
  
async function action({request} ) {
    /**
     * we are creating Metaobject mutation definition using a custom namespace that
     * and we tying to the app that way we can just define it on the app and not the
     * any thing else like product or order like metafield
     */
    const { admin } = await authenticate.admin(request);
    await admin.graphql(
      `#graphql 
    mutation($input: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $input) {
        metaobjectDefinition {
          id
          type
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
            type: "app_pre_puchase",
            access: {
              admin: "MERCHANT_READ_WRITE",
              storefront: "PUBLIC_READ",
            },
            capabilities: { publishable: { enabled: true } },
            fieldDefinitions: [
              { key: "title", type: "single_line_text_field" },
              { key: "prod_id", type: "single_line_text_field" },
            ],
          },
        },
      }
    );
}

}

export default CheckMutation