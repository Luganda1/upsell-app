import {
    Page,
    Frame,
    } from '@shopify/polaris';
import DeliveryCheckbox from "../Components/DeliveryCheckbox"
import {useState, useCallback, useEffect} from 'react';
import BannerEditor from "../Components/BannerEditor"
import { authenticate } from '~/shopify.server';
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";


export async function action({ request }) {
const { admin, session } = await authenticate.admin(request);
try {
    /**
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
            type: "app_pre_purchase_settings",
            name: "$app:pre_purchase_settings",
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
                { key: "d_instructions", name: "Delievery instructions", type: "boolean" },
                { key: "banner_title", name: "Banner title", type: "single_line_text_field" },
                { key: "json_data", name: "Other JSON Data", type: "json" }
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
    const bannerTitle = formData.get("bannerTitle");
    const deliveryCheckbox = formData.get("deliveryCheckbox");
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
                banner_title: field(key: "banner_title") { value }
                d_instructions: field(key: "d_instructions") { value }
                json_data: field(key: "json_data") { value }
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
            type: "app_pre_purchase_settings",
            capabilities: {
            publishable: {
                status: "ACTIVE",
            },
            },
            fields: [
                {
                    key: "banner_title",
                    value: "This is the new banner title"
                    },
                {
                    key: "d_instructions",
                    value: "false"
                    }
            ],
        },
        },
    }
    );

    const responseJson = await response.json();
    return responseJson;
}
}

export default function Settings() {
    const initialState = loadSettings()
    const initialchecked = initialState?.deliveryCheckbox ?? false;
    const initialTitle = initialState?.bannerTitle ?? ""; 
    const [checked, setChecked] = useState(initialchecked);
    const [bannerTitle, setBannerTitle] = useState("");
    const nav = useNavigation()
    const submit = useSubmit()

    const handleDeliveryCheckboxChange = useCallback(
        (newChecked) => setChecked(newChecked),
        [],
    );
    const handleTitleChange = useCallback((value) => setBannerTitle(value), []);

    const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

    useEffect(() => {
        //Saving current user settings into our local Storage for persistant state
        const userSettings = {
            bannerTitle,
            deliveryCheckbox: checked,
        };
        return () => {
            saveSettings(userSettings)
        }

    }, [checked, bannerTitle])

    
    const handleSubmit = () => {
        const submitData = {
            bannerTitle ,
            deliveryCheckbox: checked
        }
        submit(submitData, { replace: true, method: "POST" });
        };
    

    return (
        <Frame>
            <Page
            title="Configuration Page"
            secondaryActions={[
                {content: ''},
            ]}
            >
                <DeliveryCheckbox 
                checked={checked} 
                handleDeliveryCheckboxChange={handleDeliveryCheckboxChange}
                />
                <BannerEditor 
                    bannerTitle={bannerTitle}
                    initialTitle={initialTitle}
                    isLoading={isLoading}
                    handleSubmit={handleSubmit}
                    handleTitleChange= {handleTitleChange}
                />
            </Page>
        </Frame>
    );
}


// Function to save state to Local Storage
function saveSettings(preferences) {
localStorage.setItem('userSettings', JSON.stringify(preferences));
}

//Retrieve saved state
function loadSettings() {
const savedPreferences = localStorage.getItem('userSettings');
return savedPreferences ? JSON.parse(savedPreferences) : null;
}
