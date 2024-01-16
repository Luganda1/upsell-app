import {
    Page,
    Frame,
    } from '@shopify/polaris';
import DeliveryCheckbox from "../Components/DeliveryCheckbox"
import {useState, useCallback} from 'react';
import BannerEditor from "../Components/BannerEditor"
import { authenticate } from '~/shopify.server';
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { createCookieSessionStorage, json } from '@remix-run/node';

export async function loader({ request }) {
    // Handling persistant state with cookie session
        const sessionStore =  request.headers.get("cookie")
        let storage =  createCookieSessionStorage({
        cookie: {
            name: "current-user-settings"
        }
        })
        const  cookieSession = await storage.getSession(sessionStore)
    return json({ cookieSession });
    }

export async function action({ request }) {
const { admin } = await authenticate.admin(request);
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
            displayNameKey: "d_instructions",
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
    const userSettings = {
        bannerTitle: formData.get("title"),
        deliveryCheckbox: formData.get("deliveryCheckbox"),
    }
    //creating the userSetting metaobject
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
                    value: userSettings.bannerTitle
                    },
                {
                    key: "d_instructions",
                    value: userSettings.deliveryCheckbox
                    }
            ],
        },
        },
    }
    );
    // Saving the data in the cookie session 
    if(request.method === "POST") {
        let storage =  createCookieSessionStorage({
            cookie: {
            name: "current-user-settings"
            }
        })
        let  cookieSession = await storage.getSession()
        cookieSession.set("userSettings", userSettings)
        
        return new Response("", {
            headers: {
            "Set-Cookie": `${await storage.commitSession(cookieSession)}; Secure; Path=/; HttpOnly; SameSite=none`,
            },
        });
    }
    const responseJson = await response.json();

    return json({
        responseJson
    })
}
}

export default function Settings() {
    const { cookieSession } = useLoaderData();
    const initialState = cookieSession?.data?.userSettings;
    const initialchecked = initialState?.deliveryCheckbox ?? false;
    const initialTitle = initialState?.bannerTitle ?? ""; 
    const [checked, setChecked] = useState(initialchecked);
    const [bannerTitle, setBannerTitle] = useState(initialTitle);
    const nav = useNavigation()
    const submit = useSubmit()

    const handleDeliveryCheckboxChange = useCallback(
        (newChecked) => setChecked(newChecked),
        [],
    );
    const handleTitleChange = useCallback((value) => setBannerTitle(value), []);

    //handling submsion and loading state 
    const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";

    // submitting to the user setting mutation we created up 
    const handleSubmit = () => {
        const submitData = {
            title: bannerTitle ,
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

