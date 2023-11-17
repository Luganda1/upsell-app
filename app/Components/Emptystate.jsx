import {LegacyCard, EmptyState} from '@shopify/polaris';

export default function Emptystate({shop}) {
    return (
        <LegacyCard sectioned>
            <EmptyState
            heading="Search for a collection in the Seach Bar ☝️"
            action={{content: 'Add Product',
            url: `https://admin.shopify.com/store/${shop}/admin/products?selectedView=all`,
            target: "_blank",
            external: true,
            accessibilityLabel: "External link to Products ",
                }}
            secondaryAction={{
                content: 'Create a Category',
                url: `https://admin.shopify.com/store/${shop}/admin/collections?selectedView=all`,
                target: "_blank",
                external: true,
                accessibilityLabel: "External link to collections",
            }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
            >
            <p>If you don't have any collections on you store, please go a head and create a collection and add products accordingly</p>
            </EmptyState>
        </LegacyCard>
    );
}