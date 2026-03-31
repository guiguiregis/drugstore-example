import React, { useEffect, useState } from "react";

import {
  render,
  TextField,
  BlockStack,
  useApplyMetafieldsChange,
  useMetafield,
  Select,
  Heading,
  useCartLines,
  useBuyerJourneyIntercept,
} from "@shopify/checkout-ui-extensions-react";
import moment from "moment";

// Set the entry point for the extension
render("Checkout::Contact::RenderAfter", () => <App />);
// Define the extension component
//dev=https://75e1-142-198-101-85.ngrok.io/extensions
function App() {
  // Set up the should state
  const [shouldShowForm, setShouldShowForm] = useState(true);
  const [genderError, setGenderError] = useState("");
  const [dobError, setDOBError] = useState("");

  // Define the metafield namespace and key
  const metafieldNamespace = "pd-req-form";
  const genderMetafieldKey = "gender";
  const dobMetafieldKey = "dob";
  // const phoneMetafieldKey = "phone";

  // Get a reference to the metafield
  const gender = useMetafield({
    namespace: metafieldNamespace,
    key: genderMetafieldKey,
  });

  // const phone = useMetafield({
  //   namespace: metafieldNamespace,
  //   key: phoneMetafieldKey,
  // });

  const dob = useMetafield({
    namespace: metafieldNamespace,
    key: dobMetafieldKey,
  });

  console.log({
    dob,
    gender,
    // phone,
  });

  const cartLines = useCartLines();

  // Set a function to handle updating a metafield
  const applyMetafieldsChange = useApplyMetafieldsChange();

  useEffect(() => {
    if (cartLines) {
      const shouldShowForm = cartLines.some((line) => {
        return (
          line.merchandise.product.productType.includes("Lab") ||
          line.merchandise.product.productType.includes("Test")
        );
      });
      setShouldShowForm(shouldShowForm);
    }
  }, [cartLines]);

  useEffect(() => {
    if (!gender) {
      //add default gender
      applyMetafieldsChange({
        type: "updateMetafield",
        namespace: metafieldNamespace,
        key: genderMetafieldKey,
        valueType: "string",
        value: "female",
      });
    }
  }, [gender]);

  useEffect(() => {
    //add default gender
    if (!shouldShowForm) {
      applyMetafieldsChange({
        type: "updateMetafield",
        namespace: metafieldNamespace,
        key: dobMetafieldKey,
        valueType: "string",
        value: "n/a",
      });
    } else {
      applyMetafieldsChange({
        type: "updateMetafield",
        namespace: metafieldNamespace,
        key: dobMetafieldKey,
        valueType: "string",
        value: "",
      });
    }
  }, [shouldShowForm]);

  const isValidDate = (dateStr) => {
    const momentObj = moment(dateStr, "MM/DD/YYYY", true);
    return momentObj.isValid();
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `(function (w,d,s,u,o,c,e,x) {
      w['TrackingSystemObject']=o;
      e=d.createElement(s);e.async=1;e.src=u;e.onload=c;x=d.getElementsByTagName(s)[0];x.parentNode.insertBefore(e, x);
    })(window,document,'script','https://cdn.refersion.com/refersion.js','r',function () {
  
      // Configure SDK
      r.pubKey = 'pub_479e7db89a840d29ee05';
  
      // Initialize
      r.initializeXDLS().then(() => {
  
        r.launchDefault();
  
      });
  
    });`;
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useBuyerJourneyIntercept(() => {
    console.log({ gender, dob });
    if (shouldShowForm && !gender && !gender.value && gender.value !== "") {
      return {
        behavior: "block",
        reason: "Gender is required",
        perform: (result) => {
          //If we were able to block progress, set a validation error
          console.log(result);
          if (result.behavior === "block") {
            setGenderError("Gender is required");
          }
        },
      };
    }

    if ((shouldShowForm && !dob) || !dob.value || dob.value === "") {
      return {
        behavior: "block",
        reason: "DOB is required",
        error: {
          message: "DOB is required",
        },
        perform: (result) => {
          //If we were able to block progress, set a validation error
          if (result.behavior === "block") {
            setDOBError("DOB is required");
          }
        },
      };
    }

    console.log({ dob: dob.value, valid: !isValidDate(dob.value) });

    if (shouldShowForm && !isValidDate(dob.value)) {
      return {
        behavior: "block",
        reason: "DOB is not a valid date",
        error: {
          message: "DOB is not a valid date",
        },
        perform: (result) => {
          //If we were able to block progress, set a validation error
          if (result.behavior === "block") {
            setDOBError("Valid DOB is required");
          }
        },
      };
    }

    return {
      behavior: "allow",
      perform: () => {
        //Ensure any errors are hidden
        setDOBError("");
        setGenderError("");
      },
    };
  });

  // Render the extension components
  if (!shouldShowForm) {
    return <></>;
  }
  return (
    <BlockStack>
      <Heading level={2}>Requisition form</Heading>
      <Select
        label="Gender"
        value={gender ? String(gender.value) : null}
        options={[
          {
            value: "male",
            label: "Male",
          },
          {
            value: "female",
            label: "Female",
          },
          {
            value: "other",
            label: "Other",
          },
        ]}
        onChange={(value) => {
          // Apply the change to the metafield
          applyMetafieldsChange({
            type: "updateMetafield",
            namespace: metafieldNamespace,
            key: genderMetafieldKey,
            valueType: "string",
            value,
          });
        }}
        required={true}
        error={genderError}
      />
      <TextField
        label="Date of birth (MM/DD/YYYY)"
        multiline={1}
        required={true}
        value={dob ? String(dob.value) : null}
        onChange={(value) => {
          // Apply the change to the metafield
          applyMetafieldsChange({
            type: "updateMetafield",
            namespace: metafieldNamespace,
            key: dobMetafieldKey,
            valueType: "string",
            value,
          });
        }}
        error={dobError}
      />
      {/* <TextField
        label="Phone Number"
        multiline={1}
        value={phone ? String(phone.value) : null}
        onChange={(value) => {
          // Apply the change to the metafield
          applyMetafieldsChange({
            type: "updateMetafield",
            namespace: metafieldNamespace,
            key: phoneMetafieldKey,
            valueType: "string",
            value,
          });
        }}
        error={dobError}
      /> */}
    </BlockStack>
  );
}
