import {
    LegacyStack,
    Button,
    Form, 
    FormLayout, 
    TextField,
    Toast,
    LegacyCard,
    } from '@shopify/polaris';
import {useState, useCallback} from 'react';




export default function DeliveryCheckbox({bannerTitle, initialTitle, isLoading, handleSubmit, handleTitleChange}) {
    const [toastActive, setToastActive] = useState(false);
    // const [currentTitle, setCurrentTitle] = useState(initialTitle)

    // const submit = useSubmit();
    //Toast will trigger popup if the submit button is clicked 
    const toggleActive = useCallback(
        () =>  {
            setToastActive((toastActive) => !toastActive)
            // setCurrentTitle(bannerTitle)
        }, []);

    return (

        <LegacyCard sectioned title="Change banner title">
        <LegacyStack alignment="center">
        <LegacyStack.Item fill>
            <Form onSubmit={handleSubmit}>
                <FormLayout>
                <TextField
                    value={bannerTitle}
                    onChange={handleTitleChange}
                    label=" Title"
                    type="text"
                    placeholder={initialTitle === "" ? "You may also Like ": initialTitle}
                    autoComplete="text"
                    // pattern='^(?![\s\S]*$|^$)(?:[A-Z][a-z]*\s*){1,120}$'
                    helpText={
                    <span>
                        This will change the title of pre-purchase banner on the checkout line-item. 
                        {/* The current banner title is <strong>"{initialTitle ? "" : currentTitle}"</strong> */}
                    </span>
                    }
                />
                <>
                    <Button  submit onClick={toggleActive} loading={isLoading}>Submit</Button>
                    {toastActive && 
                    (<Toast
                        content="Title successfully updated"
                        onDismiss={toggleActive}
                    />)}
                </>
                </FormLayout>
            </Form>
        </LegacyStack.Item>
        </LegacyStack>
        </LegacyCard>
    );
}


/**
 * 
{ "key": "d_instructions", "name": "Delievery instructions", "type": "boolean" },
{ "key": "banner_title", "name": "Banner title", "type": "single_line_text_field" },
{ "key": "json_data", "name": "json data", "type": "json" }

banner_title: field(key: "banner_title") { value }
d_instructions: field(key: "d_instructions") { value }
json_data: field(key: "json_data") { value }

{
    "key": "banner_title",
    "value": "This is the new banner title"
  },
{
    "key": "d_instructions",
    "value": false
  }
{
    "key": "json_data",
    "value": [
        {
            "id": 1,
            "name": "Item One",
            "category": "Electronics",
            "price": 299.99,
            "inStock": true
        },
    ]
  }


  
  [
    {
      "id": "gid://shopify/ProductVariant/46388417954069",
      "title": "Default Title",
      "price": "140.00"
    }
  ]
 */
